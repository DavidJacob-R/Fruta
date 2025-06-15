export default function Home() {
  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Grid con Tailwind 📦</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-100 p-6 rounded-xl text-center">Bloque 1</div>
        <div className="bg-blue-100 p-6 rounded-xl text-center">Bloque 2</div>
        <div className="bg-pink-100 p-6 rounded-xl text-center">Bloque 3</div>
      </div>
    </div>
  );
}
