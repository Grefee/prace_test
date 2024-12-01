"use client";

import React from "react";
import { Button, Input, InputNumber } from "antd";
import { useEstateStore } from "../stores/itemStore";

import { useNotification } from "../providers";

interface Estate {
  hash_id: number;
  name: string;
  price_czk: {
    value_raw: number;
    unit: string;
    name: string;
  };
  locality: string;
  attractive_offer: number;
  new: boolean;
  type: number; // 1 == prodej; 2 == pronájem
}

export default function AddNewItem() {
  const [newName, setNewName] = React.useState<string>("");
  const [newLocality, setNewLocality] = React.useState<string>("");
  const [newPrice, setNewPrice] = React.useState<number | null>(null);
  const openNotification = useNotification();

  const addEstate = useEstateStore((state) => state.addEstate);

  const addNewItemBtnClick = () => {
    if (
      newName == "" ||
      newLocality == "" ||
      newPrice == null ||
      typeof newPrice != "number"
    ) {
      openNotification("Error..", "You have to input all values!");
    } else {
      const newEstate = {
        hash_id: Date.now(), // Generate a unique ID
        name: newName,
        price_czk: {
          value_raw: newPrice,
          unit: "Czk",
          name: "Price",
        },
        locality: newLocality,
        attractive_offer: 0,
        new: true,
        type: 1, // Default to 'prodej'
      };

      // Add the estate to the store
      addEstate(newEstate);

      // Display a success notification
      openNotification("Success", "New estate added successfully!");

      // Reset the form fields
      setNewName("");
      setNewLocality("");
      setNewPrice(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center">
        <span className="text-xl">Add new row</span>
      </div>
      <div className="flex flex-row items-center">
        <span className="w-32">Name:</span>
        <Input
          className="w-40"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </div>
      <div className="flex flex-row items-center">
        <span className="w-32">Locality:</span>
        <Input
          className="w-40"
          size="small"
          value={newLocality}
          onChange={(e) => setNewLocality(e.target.value)}
        />
      </div>
      <div className="flex flex-row items-center">
        <span className="w-32">Price:</span>{" "}
        <InputNumber
          className="w-40"
          size="small"
          value={newPrice}
          min={0}
          onChange={(val) => setNewPrice(val)}
        />
      </div>
      <div className="flex flex-row items-center">
        <Button onClick={addNewItemBtnClick}>Add</Button>
      </div>
    </div>
  );
}
