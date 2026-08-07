const { listSugerenciasMusicales } = require('../lib/store');
const { requireAdmin } = require('../lib/admin-auth');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const list = await listSugerenciasMusicales();
  const header = ['cancion', 'artista', 'creado'];
  const rows = list.map((r) =>
    header.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sugerencias-musicales.csv"');
  res.status(200).send(csv);
};
