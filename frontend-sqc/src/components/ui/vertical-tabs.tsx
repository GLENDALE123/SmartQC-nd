import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface VerticalTabItem {
  id: string
  label: string
  icon?: LucideIcon
  content: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

interface VerticalTabsProps {
  tabs: VerticalTabItem[]
  defaultValue?: string
  className?: string
  tabsListClassName?: string
  tabsContentClassName?: string
  onValueChange?: (value: string) => void
}

export function VerticalTabs({
  tabs,
  defaultValue,
  className,
  tabsListClassName,
  tabsContentClassName,
  onValueChange,
}: VerticalTabsProps) {
  const defaultTab = defaultValue || tabs[0]?.id

  return (
    <Tabs
      orientation="vertical"
      defaultValue={defaultTab}
      onValueChange={onValueChange}
      className={cn(
        "w-full flex flex-row items-start gap-6",
        className
      )}
    >
      <TabsList 
        className={cn(
          "shrink-0 grid grid-cols-1 h-auto w-fit gap-1 bg-muted/50 p-1.5 rounded-lg",
          tabsListClassName
        )}
      >
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                "w-full justify-start gap-3 px-4 py-3 text-sm font-medium transition-all",
                "data-[state=active]:bg-background data-[state=active]:text-foreground",
                "data-[state=active]:border",
                "hover:bg-background/50 hover:text-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-w-[180px] relative"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                {IconComponent && <IconComponent className="w-4 h-4 shrink-0" />}
                <span className="truncate">{tab.label}</span>
              </div>
              {tab.badge && (
                <span className="ml-auto bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <div className={cn("flex-1 min-w-0", tabsContentClassName)}>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="mt-0 space-y-4 focus-visible:outline-none"
          >
            <div className="animate-in fade-in-50 duration-200">
              {tab.content}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}