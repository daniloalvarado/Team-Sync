import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
  transformPriorityEnum,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader } from "lucide-react";

// --- MAPA DE CLASES DE COLOR ---
// Usamos !text-... para forzar el color sobre cualquier hover del padre
const getStatusColorClass = (status: string) => {
  switch (status) {
    case TaskStatusEnum.TODO: return "!text-[#0052CC]";
    case TaskStatusEnum.IN_PROGRESS: return "!text-yellow-600";
    case TaskStatusEnum.IN_REVIEW: return "!text-purple-500";
    case TaskStatusEnum.DONE: return "!text-green-600";
    case TaskStatusEnum.BACKLOG: return "!text-gray-600";
    default: return "";
  }
};

const getPriorityColorClass = (priority: string) => {
  switch (priority) {
    case TaskPriorityEnum.HIGH: return "!text-orange-600";
    case TaskPriorityEnum.MEDIUM: return "!text-yellow-600"; 
    case TaskPriorityEnum.LOW: return "!text-gray-600";
    default: return "";
  }
};

const RecentTasks = () => {
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const tasks: TaskType[] = data?.tasks || [];

  return (
    <div className="flex flex-col space-y-6">
      {isLoading ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}

      {tasks?.length === 0 && (
        <div className="font-semibold text-sm text-muted-foreground text-center py-5">
          Sin tareas creadas aún
        </div>
      )}

      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => {
          const name = task?.assignedTo?.name || "";
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);

          // Obtenemos las clases forzadas
          const statusClass = getStatusColorClass(task.status);
          const priorityClass = getPriorityColorClass(task.priority);

          return (
            <li
              key={task._id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-hover-dark transition-colors"
            >
              {/* Task Info */}
              <div className="flex flex-col space-y-1 flex-grow">
                <span className="text-sm capitalize text-gray-600 dark:text-gray-300 font-medium">
                  {task.taskCode}
                </span>
                <p className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {task.title}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  Vence: {task.dueDate ? format(task.dueDate, "PPP", { locale: es }) : null}
                </span>
              </div>

              {/* Task Status */}
              <div className="text-sm font-medium">
                <Badge
                  variant={TaskStatusEnum[task.status]}
                  className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                >
                  {/* Aplicamos la clase de color DIRECTAMENTE al span */}
                  <span className={statusClass}>
                    {transformStatusEnum(task.status)}
                  </span>
                </Badge>
              </div>

              {/* Task Priority */}
              <div className="text-sm ml-2">
                <Badge
                  variant={TaskPriorityEnum[task.priority]}
                  className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                >
                   {/* Aplicamos la clase de color DIRECTAMENTE al span */}
                  <span className={priorityClass}>
                    {transformPriorityEnum(task.priority)}
                  </span>
                </Badge>
              </div>

              {/* Assignee */}
              <div className="flex items-center space-x-2 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={task.assignedTo?.profilePicture || ""}
                    alt={task.assignedTo?.name}
                  />
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentTasks;