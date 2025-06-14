"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

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

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API}/boards/${params.boardId}`);
        const data: ApiResponse = await response.json();

        if (!response.ok || !data.status || !data.data) {
          throw new Error(data.msg || "Failed to fetch board");
        }

        const transformedBoard: Board = {
          id: data.data.id,
          name: data.data.name || "Untitled Board",
          columns:
            data.data.columns?.map((col) => ({
              id: col.id || `col-${Math.random().toString(36).substr(2, 9)}`,
              name: col.name || "Unnamed Column",
              cards:
                col.cards?.map((card) => ({
                  id:
                    card.id ||
                    `card-${Math.random().toString(36).substr(2, 9)}`,
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

        if (transformedBoard.members.length > 0) {
          setCurrentUser(transformedBoard.members[0]);
        } else {
          setCurrentUser({
            id: "user-1",
            name: "You",
            email: "user@example.com",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [params.boardId, API]);

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

  const handleJoinCard = (cardId: string) => {
    if (!board || !currentUser) return;

    setBoard({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => {
          if (card.id === cardId) {
            const isMember = card.members.some((m) => m.id === currentUser.id);
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
    });
  };

  const handleAddCard = (columnId: string) => {
    setNewCard({ columnId, title: "", content: "" });
  };

  const handleAddColumn = () => {
    if (!board) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: "New Column",
      cards: [],
    };

    setBoard({
      ...board,
      columns: [...board.columns, newColumn],
    });
  };

  const handleCreateCard = () => {
    if (!newCard || !newCard.title.trim() || !board || !currentUser) return;

    const newCardItem: Card = {
      id: `card-${Date.now()}`,
      title: newCard.title,
      description: newCard.content,
      columnId: newCard.columnId,
      members: [currentUser],
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
        </header>

        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">Tidak ada column</p>
          <button
            onClick={() => handleAddColumn()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tambah Column Pertama
          </button>
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
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-72 bg-gray-200 rounded-lg p-3 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">
                      {column.name}
                    </h3>
                    <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full">
                      {column.cards.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 min-h-[100px]">
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
                            className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-shadow"
                          >
                            <h4 className="font-medium text-gray-800">
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
                                  {new Date(card.dueDate).toLocaleDateString()}
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
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
