"use client";

import { useState, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faSignOutAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCookie } from "@/server/serverCookies";
import { useRouter } from "next/navigation";

// Types
type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type Card = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  members: User[];
  dueDate?: string;
};

type Column = {
  id: string;
  name: string;
  cards: Card[];
};

type Board = {
  id: string;
  name: string;
  columns: Column[];
  members: User[];
};

type ApiResponse = {
  data?: Board;
  msg?: string;
  status: boolean;
};

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCard, setNewCard] = useState<{
    columnId: string;
    title: string;
    content: string;
  } | null>(null);
  const [editingColumn, setEditingColumn] = useState<{
    id: string | null;
    name: string;
  }>({ id: null, name: "" });
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;
  const boardId = params.boardId;

  useEffect(() => {
    const handleBoardUpdate = (e: MessageEvent) => {
      try {
        const json = JSON.parse(e.data);
        if (json.id === params.boardId) {
          setBoard((prev) => {
            if (!prev) return null;

            return {
              ...prev,
              id: json.id,
              name: json.name,
              columns: json.columns,
              members: json.members || prev.members,
            };
          });
        }
      } catch (err) {
        console.error("board update failed : ", err);
      }
    };

    const handleCardUpdate = (e: MessageEvent) => {
      try {
        const json = JSON.parse(e.data);

        const isValidCard = (
          data: any
        ): data is {
          id: string;
          title: string;
          description: string;
          due_date: string;
          column_id: string;
          members: Array<{
            id: string;
            name: string;
            username: string;
            email: string;
            role: string;
            CreatedAt: string;
            UpdatedAt: string;
          }>;
          CreatedAt: string;
          UpdatedAt: string;
        } => {
          return (
            data &&
            typeof data.id === "string" &&
            typeof data.column_id === "string" &&
            Array.isArray(data.members)
          );
        };

        if (!isValidCard(json)) {
          console.warn("Received invalid card format:", json);
          return;
        }

        setBoard((prevBoard) => {
          if (!prevBoard) return null;

          const updatedCard: Card = {
            id: json.id,
            title: json.title,
            description: json.description,
            dueDate: json.due_date || undefined,
            columnId: json.column_id,
            members: json.members.map((member) => ({
              id: member.id,
              name: member.name,
              email: member.email,
            })),
          };

          let columns = prevBoard.columns.map((column) => ({
            ...column,
            cards: column.cards.filter((card) => card.id !== updatedCard.id),
          }));

          columns = columns.map((column) => {
            if (column.id === updatedCard.columnId) {
              return {
                ...column,
                cards: [...column.cards, updatedCard],
              };
            }
            return column;
          });

          return {
            ...prevBoard,
            columns,
          };
        });

        console.log("Card updated successfully:", json.id);
      } catch (err) {
        console.error("Failed to process card update:", {
          error: err,
          rawData: e.data,
        });

        toast.error("Failed to update card", {
          position: "bottom-right",
          autoClose: 5000,
        });
      }
    };

    const handleColumnUpdate = (e: MessageEvent) => {
      try {
        const json = JSON.parse(e.data);

        // Type guard untuk validasi struktur data
        const isColumnUpdateResponse = (
          data: any
        ): data is {
          data: Array<{
            id: string;
            name: string;
            board_id: string;
            cards: Array<{
              id: string;
              title: string;
              description: string;
              due_date: string;
              column_id: string;
              members: Array<{
                id: string;
                name: string;
                username: string;
                email: string;
                role: string;
                CreatedAt: string;
                UpdatedAt: string;
              }>;
              CreatedAt: string;
              UpdatedAt: string;
            }>;
            CreatedAt: string;
            UpdatedAt: string;
          }>;
        } => {
          return (
            data &&
            Array.isArray(data.data) &&
            data.data.every(
              (col) =>
                typeof col.id === "string" &&
                typeof col.name === "string" &&
                typeof col.board_id === "string" &&
                Array.isArray(col.cards)
            )
          );
        };

        if (!isColumnUpdateResponse(json)) {
          console.warn("Invalid column update format:", json);
          return;
        }

        setBoard((prevBoard) => {
          if (!prevBoard) return null;

          const updatedColumnsMap = new Map<string, any>();

          json.data.forEach((column) => {
            if (column.board_id !== boardId) return;

            updatedColumnsMap.set(column.id, {
              id: column.id,
              name: column.name,
              cards: column.cards.map((card) => ({
                id: card.id,
                title: card.title,
                description: card.description,
                dueDate: card.due_date || undefined,
                columnId: card.column_id,
                members: card.members.map((member) => ({
                  id: member.id,
                  name: member.name,
                  email: member.email,
                  username: member.username,
                  role: member.role,
                })),
                createdAt: card.CreatedAt,
                updatedAt: card.UpdatedAt,
              })),
              createdAt: column.CreatedAt,
              updatedAt: column.UpdatedAt,
            });
          });

          const updatedColumns = prevBoard.columns.map((column) =>
            updatedColumnsMap.has(column.id)
              ? updatedColumnsMap.get(column.id)
              : column
          );

          const newColumns = Array.from(updatedColumnsMap.values()).filter(
            (column) => !prevBoard.columns.some((c) => c.id === column.id)
          );

          return {
            ...prevBoard,
            columns: [...updatedColumns, ...newColumns],
          };
        });
      } catch (err) {
        console.error("Failed to process column update:", {
          error: err,
          rawData: e.data,
        });
        toast.error("Failed to process update");
      }
    };

    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await getCookie("kerjainaja_session");
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        if (token) {
          headers.append("Authorization", `Bearer ${token}`);
        }

        const response = await fetch(`${API}/boards/${params.boardId}`, {
          headers,
        });
        const data: ApiResponse = await response.json();

        if (!response.ok || !data.status || !data.data) {
          throw new Error(data.msg || "Failed to fetch board");
        }

        const transformedBoard: Board = {
          id: data.data.id,
          name: data.data.name || "Untitled Board",
          columns:
            data.data.columns?.map((col) => ({
              id: col.id,
              name: col.name || "Unnamed Column",
              cards:
                col.cards?.map((card) => ({
                  id: card.id,
                  title: card.title || "Untitled Card",
                  description: card.description || "",
                  columnId: card.columnId || col.id,
                  members: card.members || [],
                  dueDate: card.dueDate,
                })) || [],
            })) || [],
          members: data.data.members || [],
        };

        setBoard(transformedBoard);

        if (token) {
          const userResponse = await fetch(`${API}/users`, { headers });
          const userData = await userResponse.json();

          if (userResponse.ok && userData.data) {
            setCurrentUser(userData.data);
          } else {
            const userInMembers = transformedBoard.members.find(
              (member) => member.email === userData.email
            );
            setCurrentUser(userInMembers || null);
          }
        } else {
          setCurrentUser(null);
        }

        const eventSource = new EventSource(`${API}/event-stream`);

        eventSource.addEventListener("board_update", handleBoardUpdate);
        eventSource.addEventListener("card_update", handleCardUpdate);
        eventSource.addEventListener("column_update", handleColumnUpdate);

        eventSource.onerror = (error) => {
          console.warn("SSE CONNECTION ERROR ", error);
          eventSource.close();
        };

        return () => {
          eventSource.close();
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [params.boardId, API]);

  //const { boardId } = React.use(params);

  const handleBackToBoards = () => {
    router.push("/boards");
  };

  // Handler for leave board
  const handleLeaveBoard = async () => {
    try {
      const token = await getCookie("kerjainaja_session");
      const response = await fetch(`${API}/boards/${params.boardId}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push("/boards");
        toast.success("Successfully left the board");
      } else {
        throw new Error("Failed to leave board");
      }
    } catch (error) {
      toast.error("Error leaving board");
      console.error(error);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!board) return;

    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = board.columns.find(
      (col) => col.id === source.droppableId
    );
    const finishColumn = board.columns.find(
      (col) => col.id === destination.droppableId
    );

    if (!startColumn || !finishColumn) return;

    // Moving within same column
    if (startColumn.id === finishColumn.id) {
      const newCards = Array.from(startColumn.cards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);

      const newColumn = {
        ...startColumn,
        cards: newCards,
      };

      setBoard({
        ...board,
        columns: board.columns.map((col) =>
          col.id === newColumn.id ? newColumn : col
        ),
      });
      return;
    }

    // Moving between columns
    const startCards = Array.from(startColumn.cards);
    const [removed] = startCards.splice(source.index, 1);
    removed.columnId = finishColumn.id;

    const finishCards = Array.from(finishColumn.cards);
    finishCards.splice(destination.index, 0, removed);

    const newStartColumn = {
      ...startColumn,
      cards: startCards,
    };

    const newFinishColumn = {
      ...finishColumn,
      cards: finishCards,
    };

    setBoard({
      ...board,
      columns: board.columns.map((col) => {
        if (col.id === newStartColumn.id) return newStartColumn;
        if (col.id === newFinishColumn.id) return newFinishColumn;
        return col;
      }),
    });
  };

  const handleAddNewColumn = async () => {
    if (!board) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API}/column`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Column",
          board_id: `${params.boardId}`,
        }),
        credentials: "include",
      });

      const result = await response.json();
      // TODO: ini cuy

      if (!response.ok || !result.status) {
        toast.error(result.msg || "Failed to add column", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      if (!result?.data) {
        toast.error(result.msg || "No column information", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const newColumn: Column = {
        id: result.data.id,
        name: result.data.name,
        cards: [],
      };

      setBoard({
        ...board,
        columns: [...board.columns, newColumn],
      });
    } catch (error) {
      toast.error("something is error", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (columnId: string, currentName: string) => {
    setEditingColumn({ id: columnId, name: currentName });
  };

  const handleSaveEdit = async () => {
    if (!editingColumn.id || !board) return;

    try {
      setIsLoading(true);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = await getCookie("kerjainaja_session");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API}/column/${editingColumn.id}`, {
        headers: headers,
        method: "PUT",
        body: JSON.stringify({
          name: editingColumn.name,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        toast.error(result.msg || "Failed to change title", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      setBoard({
        ...board,
        columns: board.columns.map((col) =>
          col.id === editingColumn.id
            ? { ...col, name: editingColumn.name }
            : col
        ),
      });
      setEditingColumn({ id: null, name: "" });
    } catch (error) {
      toast.error(`${error}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (columnId: string, cardId: string) => {
    if (!board) return;
    try {
      setIsLoading(true);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = await getCookie("kerjainaja_session");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API}/cards/${cardId}`, {
        headers: headers,
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.status) {
        toast.error(result.msg || "failed to delete card");
        return;
      }

      setBoard({
        ...board,
        columns: board.columns.map((column) => {
          if (column.id === columnId) {
            return {
              ...column,
              cards: column.cards.filter((card) => card.id !== cardId),
            };
          }
          return column;
        }),
      });
    } catch (error) {
      toast.error("something wrong");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCard = async (cardId: string) => {
    if (!board || !currentUser) {
      toast.error("You need to login first");
      return;
    }

    try {
      const token = await getCookie("kerjainaja_session");
      if (!token) {
        toast.error("You need to login first");
        return;
      }
      const isMember = board.columns.some((column) =>
        column.cards.some(
          (card) =>
            card.id === cardId &&
            card.members.some((m) => m.id === currentUser.id)
        )
      );

      const response = await fetch(`${API}/cards/${cardId}/members`, {
        method: isMember ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.status) {
        toast.error(result.msg || "Failed to update membership");
        return;
      }

      setBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) => {
              if (card.id === cardId) {
                return {
                  ...card,
                  members: isMember
                    ? card.members.filter((m) => m.id !== currentUser.id)
                    : [...card.members, currentUser],
                };
              }
              return card;
            }),
          })),
        };
      });
    } catch (error) {
      toast.error("Failed to update membership");
      console.error(error);
    }
  };

  const handleAddCard = (columnId: string) => {
    setNewCard({ columnId, title: "", content: "" });
  };

  const handleCreateCard = async () => {
    if (!newCard || !newCard.title.trim() || !board || !currentUser) return;

    try {
      setIsLoading(true);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = await getCookie("kerjainaja_session");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const body: Record<string, string> = {
        title: newCard.title,
        description: newCard.content,
        column_id: newCard.columnId,
      };

      const response = await fetch(`${API}/cards`, {
        headers: headers,
        method: "POST",
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !response.status) {
        toast.error(result.msg || "Failed to add card", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const newCardItem: Card = {
        id: result.data.id,
        title: result.data.title,
        description: result.data.description,
        columnId: result.data.column_id,
        members: result.data.members,
      };

      setBoard({
        ...board,
        columns: board.columns.map((column) => {
          if (column.id === newCard.columnId) {
            return {
              ...column,
              cards: [...column.cards, newCardItem],
            };
          }
          return column;
        }),
      });

      setNewCard(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Board</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Board Not Found</h1>
        <p>The requested board could not be loaded.</p>
      </div>
    );
  }

  if (board.columns.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
          {board.members.length > 0 && (
            <div className="flex justify-center mt-3 space-x-2">
              {board.members.map((member) => (
                <span
                  key={member.id}
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    member.id === currentUser?.id
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {member.name}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="flex flex-col items-center max-w-md text-center">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada tugas
          </h3>
          <p className="text-gray-500 mb-6">Yuk buat kartu baru</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddNewColumn}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Tambah Column
            </button>
            <button
              onClick={handleLeaveBoard}
              className="px-5 py-2.5 flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
              title="Leave this board"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{board.name}</h1>
        <div className="flex items-center mt-2">
          <span className="text-sm text-gray-600">Members: </span>
          {board.members.map((member) => (
            <span
              key={member.id}
              className={`ml-2 text-xs px-2 py-1 rounded-full ${
                member.id === currentUser?.id
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {member.name}
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleBackToBoards}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Back to all boards"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Boards</span>
          </button>

          <button
            onClick={handleLeaveBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
            title="Leave this board"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row md:overflow-x-auto space-y-4 md:space-y-0 md:space-x-4 pb-4">
          {board.columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => {
                const cardsEndRef = useRef<HTMLDivElement>(null);

                useEffect(() => {
                  cardsEndRef.current?.scrollIntoView({ behavior: "auto" });
                }, [column.cards]);

                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-full md:w-72 bg-gray-200 rounded-lg p-3 flex flex-col"
                    style={{ maxHeight: "calc(100vh - 200px)" }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      {editingColumn.id === column.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingColumn.name}
                            onChange={(e) =>
                              setEditingColumn({
                                ...editingColumn,
                                name: e.target.value,
                              })
                            }
                            className="flex-1 px-2 py-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-500 hover:text-green-700 transition-colors"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3
                            className="font-semibold text-gray-700 cursor-text flex-1"
                            onClick={() =>
                              handleStartEdit(column.id, column.name)
                            }
                          >
                            {column.name}
                          </h3>
                          <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full">
                            {column.cards.length}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 min-h-[100px] overflow-y-auto">
                      {column.cards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-shadow relative"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCard(column.id, card.id);
                                }}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Delete card"
                              >
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="text-sm"
                                />
                              </button>
                              <h4 className="font-medium text-gray-800 pr-6">
                                {card.title}
                              </h4>
                              {card.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {card.description}
                                </p>
                              )}
                              {card.dueDate && (
                                <div className="mt-1">
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Due:{" "}
                                    {new Date(
                                      card.dueDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  {card.members.map((member) => (
                                    <span
                                      key={member.id}
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        member.id === currentUser?.id
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {member.name.split(" ")[0]}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  onClick={() => handleJoinCard(card.id)}
                                  className={`text-xs px-2 py-1 rounded ${
                                    card.members.some(
                                      (m) => m.id === currentUser?.id
                                    )
                                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                  disabled={!currentUser}
                                >
                                  {card.members.some(
                                    (m) => m.id === currentUser?.id
                                  )
                                    ? "Leave"
                                    : "Join"}
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      <div ref={cardsEndRef} />

                      {newCard?.columnId === column.id ? (
                        <div className="bg-white rounded-lg p-3 shadow">
                          <input
                            type="text"
                            placeholder="Card title"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                            value={newCard.title}
                            onChange={(e) =>
                              setNewCard({
                                ...newCard,
                                title: e.target.value,
                              })
                            }
                            autoFocus
                          />
                          <textarea
                            placeholder="Card description"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCard.content}
                            onChange={(e) =>
                              setNewCard({
                                ...newCard,
                                content: e.target.value,
                              })
                            }
                            rows={3}
                          />
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={handleCreateCard}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              disabled={!newCard.title.trim()}
                            >
                              Add Card
                            </button>
                            <button
                              onClick={() => setNewCard(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddCard(column.id)}
                          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          + Add a card
                        </button>
                      )}
                    </div>
                  </div>
                );
              }}
            </Droppable>
          ))}
          <div className="w-10 h-10 ml-2">
            <button
              onClick={handleAddNewColumn}
              className="w-full h-full flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md"
              title="Add column"
            >
              <FontAwesomeIcon icon={faPlus} className="text-sm" />
            </button>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
