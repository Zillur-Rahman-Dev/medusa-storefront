import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  onDelete,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  onDelete?: (id: string) => void
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    if (onDelete) {
      onDelete(id)
    } else {
      await deleteLineItem(id).catch(() => {
        setIsDeleting(false)
      })
    }
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex items-center gap-x-1.5 text-inherit hover:opacity-80 transition-opacity cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? (
          <Spinner className="animate-spin w-3.5 h-3.5" />
        ) : (
          <Trash className="w-3.5 h-3.5" />
        )}
        {children ? <span>{children}</span> : null}
      </button>
    </div>
  )
}

export default DeleteButton
