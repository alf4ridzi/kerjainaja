"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "@/server/serverCookies";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSpinner,
  faArrowRight,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Metadata } from "next";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { redirect, useRouter } from "next/navigation";
import Modal from "@/components/ui/modal"; // You'll need a Modal component

export const metadata: Metadata = {
  title: "Boards",
};

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

interface Board {
  id: string;
  name: string;
  members: null | any[];
  columns: null | any[];
  CreatedAt: string;
  UpdatedAt: string;
}

interface ApiResponse {
  data: {
    boards: Board[];
  };
  msg: string;
  status: boolean;
}

export default function BoardsForm() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        await new Promise((f) => setTimeout(f, 1200));

        setIsLoading(true);
        setLoading(true);

        const headers: Record<string, string> = {};
        const token = await getCookie("kerjainaja_session");

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // ngrok deploy testing
        if (process.env.NODE_ENV !== "production") {
          headers["ngrok-skip-browser-warning"] = "blabla";
        }

        headers["Content-Type"] = "application/json";

        const response = await fetch(`${API}/boards`, {
          method: "GET",
          headers: headers,
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
          if (response.status == 401) {
            toast.error("Access Denied");
            router.push("/");
            return;
          }

          throw new Error(data.msg || "Failed to fetch boards");
        }

        setBoards(data.data.boards);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      const token = await getCookie("kerjainaja_session");

      if (!token) {
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // ngrok deploy testing
      if (process.env.NODE_ENV !== 'production'){
        headers["ngrok-skip-browser-warning"] = "blabla";
      }

      const response = await fetch(`${API}/users`, {
        headers: headers,
        method: "GET",
      });

      const userData = await response.json();

      if (response.ok && userData.status) {
        setCurrentUser(userData.data);
        metadata.title = currentUser?.name + " Boards";
      }
    };

    fetchBoards();
    fetchUser();
  }, []);

  const [boardId, setBoardId] = useState("");

  const handleJoinBoard = () => {
    if (!boardId.trim()) {
      toast.error("Please enter a valid board ID");
      return;
    }
    router.push(`/boards/${boardId.trim()}`);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const token = await getCookie("kerjainaja_session");
      if (!token) {
        toast.error("no token found");
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      // ngrok deploy testing
      if (process.env.NODE_ENV !== 'production'){
        headers["ngrok-skip-browser-warning"] = "blabla";
      }

      const response = await fetch(`${API}/logout`, {
        headers: headers,
        credentials: "include",
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        toast.error(data.msg || "failed to logout");
        return;
      }

      toast.success("success logout");

      router.push("/");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    try {
      if (!newBoardName.trim()) return;

      setIsCreating(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const headers: Record<string, string> = {};

      const token = await getCookie("kerjainaja_session");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      headers["Content-Type"] = "application/json";

      const body: Record<string, string> = {
        name: newBoardName,
      };

      const response = await fetch(`${API}/board`, {
        headers: headers,
        method: "POST",
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.status) {
        toast.error(result.msg || "Failed to add board", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const newBoard = {
        id: result.data.id,
        name: result.data.name,
        members: result.data.members,
        columns: [],
        CreatedAt: result.data.CreatedAt,
        UpdatedAt: result.data.UpdatedAt,
      };

      setBoards([...boards, newBoard]);
      setNewBoardName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create board:", error);
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-blue-500"
        >
          <FontAwesomeIcon icon={faSpinner} size="2x" />
        </motion.div>
        <h1 className="text-2xl font-bold mt-4">Loading your boards...</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Try Again
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4">
            {currentUser?.name} Boards
          </h1>
          <p className="text-gray-600 mb-8">
            No boards found. Create your first board!
          </p>

          {isCreating ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 mb-8"
            >
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="e.g. Marketing Campaign"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim() || isCreating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <FontAwesomeIcon icon={faSpinner} />
                      </motion.span>
                      Creating...
                    </span>
                  ) : (
                    "Create Board"
                  )}
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Board
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <FontAwesomeIcon icon={faLink} />
                Join Board
              </motion.button>
            </div>
          )}

          {/* Join Board Modal */}
          <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Join Existing Board
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Board ID
                  </label>
                  <input
                    type="text"
                    value={boardId}
                    onChange={(e) => setBoardId(e.target.value)}
                    placeholder="Paste board ID here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinBoard}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{currentUser?.name} Boards</h1>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoinModal(true)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faLink} />
              Join Board
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              New Board
            </motion.button>
          </div>
        </div>

        {/* Join Board Modal */}
        <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)}>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Join Existing Board</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board ID
                </label>
                <input
                  type="text"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  placeholder="Paste board ID here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinBoard}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
              />
              <button
                onClick={handleCreateBoard}
                disabled={!newBoardName.trim() || isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <motion.div
              key={board.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/boards/${board.id}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {board.name}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span>
                      Created: {new Date(board.CreatedAt).toLocaleDateString()}
                    </span>
                    {board.columns && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {board.columns.length} columns
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                    Open board
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
