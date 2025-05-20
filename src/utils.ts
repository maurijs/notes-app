export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return "Fecha no disponible";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "Fecha inválida";

  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};