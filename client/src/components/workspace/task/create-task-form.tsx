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
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformOptions,
} from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createTaskMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function CreateTaskForm(props: {
  projectId?: string;
  onClose: () => void;
}) {
  const { projectId, onClose } = props;

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: createTaskMutationFn,
  });

  const { data, isLoading } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    skip: !!projectId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = memberData?.members || [];

  //Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-1">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });

  // Workspace Members
  const membersOptions = members?.map((member) => {
    const name = member.userId?.name || "Desconocido";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const formSchema = z.object({
    title: z.string().trim().min(1, {
      message: "El título es obligatorio",
    }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, {
      message: "El proyecto es obligatorio",
    }),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      {
        required_error: "El estado es obligatorio",
      }
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
      {
        required_error: "La prioridad es obligatoria",
      }
    ),
    assignedTo: z.string({
      required_error: "Asignar a alguien es obligatorio",
    }).trim().min(1, {
      message: "Asignar a alguien es obligatorio",
    }),
    dueDate: z.date({
      required_error: "La fecha de vencimiento es obligatoria.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: projectId ? projectId : "",
    },
  });

  const taskStatusList = Object.values(TaskStatusEnum);
  const taskPriorityList = Object.values(TaskPriorityEnum);

  const statusOptions = transformOptions(taskStatusList);
  const priorityOptions = transformOptions(taskPriorityList);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      projectId: values.projectId,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["project-analytics", projectId],
        });

        queryClient.invalidateQueries({
          queryKey: ["all-tasks", workspaceId],
        });

        toast({
          title: "Éxito",
          description: "Tarea creada correctamente",
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
          <h1
            className="text-xl tracking-[-0.16px] font-semibold mb-1
            text-center sm:text-left"
          >
            Crear tarea
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Organiza y gestiona tareas, recursos y colaboración del equipo
          </p>
        </div>
        <Form {...form}>
          <form 
            className="space-y-3" 
            onSubmit={form.handleSubmit(onSubmit)}
            autoComplete="off" 
          >
            {/* HACK: Input fantasma */}
            <input type="hidden" name="chrome-autofill-dummy" style={{display:'none'}} />

            {/* {Title} */}
            <div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    {/* FIX: htmlFor agregado */}
                    <FormLabel htmlFor="title" className="text-sm">
                      Título de la tarea
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="title"
                        placeholder="Nueva Tarea"
                        className="!h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {Description} */}
            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    {/* FIX: htmlFor agregado */}
                    <FormLabel htmlFor="description" className="text-sm">
                      Descripción de la tarea
                      <span className="text-xs font-extralight ml-2">
                        Opcional
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        id="description"
                        rows={1} 
                        placeholder="Descripción" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {ProjectId} */}
            {!projectId && (
              <div>
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      {/* FIX: htmlFor agregado */}
                      <FormLabel htmlFor={field.name}>Proyecto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        name={field.name} 
                      >
                        <FormControl>
                          <SelectTrigger id={field.name} name={field.name}>
                            <SelectValue placeholder="Selecciona un proyecto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoading && (
                            <div className="my-2">
                              <Loader className="w-4 h-4 place-self-center flex animate-spin" />
                            </div>
                          )}
                          <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                            {projectOptions?.map((option) => (
                              <SelectItem
                                key={option.value}
                                className="!capitalize cursor-pointer"
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* {Members AssigneeTo} */}
            <div>
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    {/* FIX: htmlFor agregado */}
                    <FormLabel htmlFor={field.name}>Asignado a</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      name={field.name} 
                    >
                      <FormControl>
                        <SelectTrigger id={field.name} name={field.name}>
                          <SelectValue placeholder="Selecciona un asignatario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                          {membersOptions?.map((option) => (
                            <SelectItem
                              className="cursor-pointer"
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {Due Date} */}
            <div className="!mt-2">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    {/* FIX: htmlFor agregado */}
                    <FormLabel htmlFor={field.name}>Fecha límite</FormLabel>
                    
                    <input 
                      type="hidden" 
                      name={field.name}
                      id={`${field.name}-hidden`}
                      value={field.value ? format(field.value, "yyyy-MM-dd") : ""} 
                    />
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            id={field.name}
                            name={field.name}
                            type="button"
                            variant={"outline"}
                            className={cn(
                              "w-full flex-1 pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            date > new Date("2100-12-31")
                          }
                          initialFocus
                          defaultMonth={new Date()}
                          fromMonth={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {Status} */}
            <div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    {/* FIX: htmlFor agregado */}
                    <FormLabel htmlFor={field.name}>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      name={field.name} 
                    >
                      <FormControl>
                        <SelectTrigger id={field.name} name={field.name}>
                          <SelectValue
                            className="!text-muted-foreground !capitalize"
                            placeholder="Selecciona un estado"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions?.map((status) => (
                          <SelectItem
                            className="!capitalize"
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {Priority} */}
            <div>
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    {/* FIX: htmlFor agregado */}
                    <FormLabel htmlFor={field.name}>Prioridad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      name={field.name} 
                    >
                      <FormControl>
                        <SelectTrigger id={field.name} name={field.name}>
                          <SelectValue placeholder="Selecciona una prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions?.map((priority) => (
                          <SelectItem
                            className="!capitalize"
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              className="flex place-self-end h-[40px] text-white font-semibold dark:text-[#121212]"
              type="submit"
              disabled={isPending}
            >
              {isPending && <Loader className="animate-spin" />}
              Crear
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}