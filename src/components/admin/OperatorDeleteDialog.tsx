import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { EditableOperator } from "@/context/OperatorCatalogContext";

export function OperatorDeleteDialog({
  operator,
  onClose,
  onDelete,
}: {
  operator: EditableOperator | null;
  onClose: () => void;
  onDelete: (operator: EditableOperator) => void;
}) {
  return (
    <AlertDialog open={!!operator} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="border-line bg-bg text-ink">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {operator?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the operator from the database and public site.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-crimson text-white hover:bg-crimson/90"
            onClick={() => operator && onDelete(operator)}
          >
            Delete operator
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
