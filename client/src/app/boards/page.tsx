"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "@/server/serverCookies";

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

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null >(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const headers: Record<string, string> = {};
        
        const token = await getCookie("kerjainaja_session");
  
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
  
        headers["Content-Type"] = "application/json";

        const response = await fetch(`${API}/boards`, {
          method: "GET",
          headers: headers,
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
          throw new Error(data.msg || 'Failed to fetch boards');
        }

        setBoards(data.data.boards);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Boards</h1>
        <p>Loading boards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Boards</h1>
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Boards</h1>
        <p>No boards found. Create your first board!</p>
      </div>
    );
  }

  return (
    <>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Boards</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition-colors block"
          >
            <h2 className="text-xl font-semibold">{board.name}</h2>
            <p className="text-blue-100 mt-2">
              Created: {new Date(board.CreatedAt).toLocaleDateString()}
            </p>
            {board.columns && (
              <p className="text-blue-100 mt-1">
                {board.columns.length} columns
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
