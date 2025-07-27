import { useState } from "react"
import { LayoutIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"

import { useTableInstanceContext } from "./table-instance-provider"

interface DataTableColumnsVisibilityProps {
  columnLabels?: Record<string, string>
}

export function DataTableColumnsVisibility({ 
  columnLabels = {} 
}: DataTableColumnsVisibilityProps) {
  const [open, setOpen] = useState(false)
  const { tableInstance: table } = useTableInstanceContext()

  // Note: Removed useHotkeys since it's not available in React/Vite by default
  // Can be added later if needed

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="열 표시/숨김"
                variant="outline"
                size="sm"
                className="ml-auto hidden h-8 lg:flex"
              >
                <LayoutIcon className="mr-2 size-4" />
                열
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2 border bg-accent font-semibold text-foreground dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40">
            열 표시/숨김
            <div>
              <Kbd variant="outline" className="font-sans">
                ⇧
              </Kbd>{" "}
              <Kbd variant="outline" className="font-sans">
                C
              </Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        align="end"
        className="w-40 dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40"
      >
        <DropdownMenuLabel>열 표시/숨김</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            const columnLabel = columnLabels[column.id] || column.id
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                onSelect={(e) => e.preventDefault()}
              >
                <span className="truncate">{columnLabel}</span>
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}