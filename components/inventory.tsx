"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTable } from "@/components/inventory-table";
import { ItemDialog } from "@/components/item-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { InventoryReports } from "@/components/inventory-reports";
import type { Item } from "@/lib/types";

// Define CATEGORIES here
const CATEGORIES = ["Electronics", "Furniture", "Stationery"] as const;
type Category = (typeof CATEGORIES)[number];

// Sample initial data
const initialItems: Item[] = [
  {
    id: "1",
    name: "Laptop",
    description: "",
    category: "Electronics",
    quantity: 15,
    price: 1200,
    supplier: "",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Office Chair",
    description: "",
    category: "Furniture",
    quantity: 25,
    price: 250,
    supplier: "",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Printer",
    description: "",
    category: "Electronics",
    quantity: 5,
    price: 350,
    supplier: "",
    lastUpdated: new Date().toISOString(),
  },
];

export function Inventory() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter items based on search term (name only)
  const filteredItems = items.filter((item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddItem = (item: Item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    };
    setItems([...items, newItem]);
    toast({
      title: "Item Added",
      description: `${item.name} has been added to inventory.`,
    });
  };

  const handleEditItem = (updatedItem: Item) => {
    setItems(
      items.map((item) =>
        item.id === updatedItem.id
          ? { ...updatedItem, lastUpdated: new Date().toISOString() }
          : item
      )
    );
    toast({
      title: "Item Updated",
      description: `${updatedItem.name} has been updated.`,
    });
  };

  const handleSaveItem = (item: Item) => {
    if (dialogMode === "add") {
      handleAddItem(item);
    } else {
      handleEditItem(item);
    }
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find((item) => item.id === id);
    setCurrentItem(itemToDelete || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentItem) {
      const deletedItem = currentItem;
      const updatedItems = items.filter((item) => item.id !== deletedItem.id);

      const originalItems = [...items];

      setItems(updatedItems);

      const { dismiss } = toast({
        title: "Item Deleted",
        description: `${deletedItem.name} has been removed from inventory.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dismiss();

              setItems(originalItems);

              toast({
                title: "Item Restored",
                description: `${deletedItem.name} has been restored to inventory.`,
              });
            }}
          >
            Undo
          </Button>
        ),
      });

      setIsDeleteDialogOpen(false);
      setCurrentItem(null);
    }
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setCurrentItem(null);
    setIsItemDialogOpen(true);
  };

  const openEditDialog = (item: Item) => {
    setDialogMode("edit");
    setCurrentItem(item);
    setIsItemDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="reports" className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 order-2 sm:order-1">
            <TabsTrigger value="reports" className="mr-1 hover:bg-gray-200">
              Reports
            </TabsTrigger>
            <TabsTrigger value="inventory" className="ml-1 hover:bg-gray-200">
              Inventory
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={openAddDialog}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </div>
        <TabsContent value="inventory" className="space-y-4">
          <InventoryTable
            items={filteredItems}
            onEdit={openEditDialog}
            onDelete={handleDeleteItem}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </TabsContent>
        <TabsContent value="reports">
          <InventoryReports items={items} />
        </TabsContent>
      </Tabs>

      <ItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        onSave={handleSaveItem}
        existingItems={items}
        item={currentItem}
        mode={dialogMode}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={currentItem?.name || ""}
      />
    </div>
  );
}
