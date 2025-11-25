import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { editTaskMutationFn } from "@/lib/api";
import { transformStatusEnum } from "@/lib/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TaskType } from "@/types/api.type";

export default function EditTaskForm({ task, onClose }: { task: TaskType; onClose: () => void }) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: editTaskMutationFn,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);
  const members = memberData?.members || [];

  // Members Dropdown Options
  const membersOptions = members.map((member) => ({
    label: member.userId?.name || "Desconocido",
    value: member.userId?._id || "",
  }));

  // Status & Priority Options
  const statusOptions = Object.values(TaskStatusEnum).map((status) => ({
    label: transformStatusEnum(status),
    value: status,
  }));

  const priorityOptions = Object.values(TaskPriorityEnum).map((priority) => {
    const priorityLabels: Record<string, string> = {
      LOW: "Baja",
      MEDIUM: "Media",
      HIGH: "Alta",
    };
    return {
      label: priorityLabels[priority] || priority,
      value: priority,
    };
  });

  const formSchema = z.object({
    title: z.string().trim().min(1, { message: "El título es obligatorio" }),
    description: z.string().trim(),
    status: z.enum(Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum]),
    priority: z.enum(Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum]),
    assignedTo: z.string().trim().min(1, { message: "Asignado a es obligatorio" }),
    dueDate: z.date({ required_error: "La fecha de vencimiento es obligatoria." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "TODO",
      priority: task?.priority ?? "MEDIUM",
      assignedTo: task.assignedTo?._id ?? "",
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    const payload = {
      workspaceId,
      projectId: task.project?._id ?? "",
      taskId: task._id,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
        toast({
          title: "Éxito",
          description: "Tarea actualizada exitosamente",
          variant: "success",
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 pb-2 border-b">
          <h1 className="text-xl font-semibold text-center sm:text-left">Editar tarea</h1>
        </div>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Title */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Título de la tarea</FormLabel>
                <FormControl><Input {...field} placeholder="Título de la tarea" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción de la tarea</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Descripción" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Assigned To */}
            <FormField control={form.control} name="assignedTo" render={({ field }) => (
              <FormItem>
                <FormLabel>Asignado a</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un asignatario" /></SelectTrigger></FormControl>
                  <SelectContent>
                  <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                    {membersOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                    </div>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Due Date */}
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha límite</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline">
                        {field.value ? format(field.value, "PPP", { locale: es }) : "Elige una fecha"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            {/* Status */}
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Priority */}
            <FormField control={form.control} name="priority" render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una prioridad" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Guardar Cambios
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
