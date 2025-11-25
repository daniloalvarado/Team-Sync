import WorkspaceForm from "./create-workspace-form";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
const CreateWorkspaceDialog = () => {
  const { open, onClose } = useCreateWorkspaceDialog();

  return (
    <Dialog modal={true} open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl !p-0 overflow-hidden border-0">
        <DialogHeader className="hidden">
          <DialogTitle>Crear Espacio de Trabajo</DialogTitle>
          <DialogDescription>
            Formulario para crear un nuevo espacio de trabajo.
          </DialogDescription>
        </DialogHeader>
        <WorkspaceForm {...{ onClose }} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;
