import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React from "react";

interface SheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
}

export function SheetForm({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerContent,
  className,
}: SheetFormProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={className}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
        {footerContent && <SheetFooter>{footerContent}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
