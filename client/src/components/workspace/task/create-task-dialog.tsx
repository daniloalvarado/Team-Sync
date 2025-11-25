import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,      
  DialogTitle,       
  DialogDescription, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";

const CreateTaskDialog = (props: { projectId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
          <DialogHeader className="hidden">
            <DialogTitle>Crear Nueva Tarea</DialogTitle>
            <DialogDescription>
              Formulario para agregar una nueva tarea al proyecto.
            </DialogDescription>
          </DialogHeader>

          <CreateTaskForm projectId={props.projectId} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTaskDialog;