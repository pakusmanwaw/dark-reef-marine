import { Link } from "react-router-dom";

function BiotaCard({ biota }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex aspect-square items-center justify-center bg-slate-100">
        <span className="text-7xl">
          🪸
        </span>
      </div>

      <div className="p-6">

        <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
          {biota.category}
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          {biota.name}
        </h2>

        <p className="mt-1 text-sm italic text-slate-400">
          {biota.scientificName}
        </p>

        <div className="mt-4 flex justify-between text-sm">
          <span className="text-slate-400">
            Size
          </span>

          <span className="font-semibold text-slate-700">
            {biota.size}
          </span>
        </div>

        <p className="mt-5 text-lg font-bold text-cyan-600">
          {biota.price > 0
            ? `Rp ${biota.price}`
            : "Harga dapat ditanyakan"}
        </p>

        <Link
          to={`/biota/${biota.id}`}
          className="mt-5 block rounded-xl border border-cyan-600 px-4 py-3 text-center text-sm font-bold text-cyan-600 transition hover:bg-cyan-600 hover:text-white"
        >
          Lihat Detail
        </Link>

      </div>

    </article>
  );
}

export default BiotaCard;