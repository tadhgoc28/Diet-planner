"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toaster";
import { apiSend, ApiError } from "@/lib/api";

export function DeleteRecipeButton({
  recipeId,
  recipeTitle,
}: {
  recipeId: string;
  recipeTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await apiSend(`/api/recipes/${recipeId}`, "DELETE");
      mutate("/api/recipes");
      toast("Recipe deleted", "success");
      router.push("/recipes");
    } catch (err) {
      setDeleting(false);
      setOpen(false);
      toast(err instanceof ApiError ? err.message : "Couldn't delete the recipe.");
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Modal
        open={open}
        onClose={() => !deleting && setOpen(false)}
        title="Delete this recipe?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              Keep it
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              Delete recipe
            </Button>
          </>
        }
      >
        <p>
          <strong className="text-ink">{recipeTitle}</strong> and its ingredients
          and steps will be permanently removed. Any planner entries using it will
          be cleared too.
        </p>
      </Modal>
    </>
  );
}
