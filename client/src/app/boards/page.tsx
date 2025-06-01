export default function BoardsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Boards</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/boards/1" className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition-colors">
          <h2 className="text-xl font-semibold">Project Board</h2>
          <p className="text-blue-100 mt-2">3 columns, 4 tasks</p>
        </a>
      </div>
    </div>
  );
}
