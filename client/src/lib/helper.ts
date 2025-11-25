//THE UPDATED ONE BECAUSE OF THE FILTERS ->  Take Note ->
const statusLabels: Record<string, string> = {
  BACKLOG: "Como Idea",
  TODO: "Por Hacer",
  IN_PROGRESS: "En Progreso",
  IN_REVIEW: "En Revisión",
  DONE: "Completado",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export const transformOptions = (
  options: string[],
  iconMap?: Record<string, React.ComponentType<{ className?: string }>>
) =>
  options.map((value) => {
    const statusLabel = statusLabels[value as keyof typeof statusLabels];
    const priorityLabel = priorityLabels[value as keyof typeof priorityLabels];
    const label = statusLabel || priorityLabel || value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    return {
      label,
      value: value,
      icon: iconMap ? iconMap[value] : undefined,
    };
  });

const statusLabelMap: Record<string, string> = {
  BACKLOG: "Como Idea",
  TODO: "Por Hacer",
  IN_PROGRESS: "En Progreso",
  IN_REVIEW: "En Revisión",
  DONE: "Completado",
};

const priorityLabelMap: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export const transformStatusEnum = (status: string): string => {
  return statusLabelMap[status] || status.replace(/_/g, " ");
};

export const transformPriorityEnum = (priority: string): string => {
  return priorityLabelMap[priority] || priority.replace(/_/g, " ");
};

export const translateRole = (role: string): string => {
  const roleLabels: Record<string, string> = {
    OWNER: "Propietario",
    ADMIN: "Administrador",
    MEMBER: "Miembro",
  };
  return roleLabels[role] || role;
};

export const formatStatusToEnum = (status: string): string => {
  return status.toUpperCase().replace(/\s+/g, "_");
};

export const getAvatarColor = (initials: string): string => {
  const colors = [
    "bg-red-500 text-white",
    "bg-blue-500 text-white",
    "bg-green-500 text-white",
    "bg-yellow-500 text-black",
    "bg-purple-500 text-white",
    "bg-pink-500 text-white",
    "bg-teal-500 text-white",
    "bg-orange-500 text-black",
    "bg-gray-500 text-white",
  ];

  // Simple hash to map initials to a color index
  const hash = initials
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
};

export const getAvatarFallbackText = (name: string) => {
  if (!name) return "NA";
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2); // Ensure only two initials
  return initials || "NA";
};
