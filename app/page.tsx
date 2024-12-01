"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  Skeleton,
  Select,
  Input,
  InputNumber,
  Button,
  Modal,
  List,
} from "antd";
import {
  UpOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEstateStore } from "./stores/itemStore";
import ThemeSwitcher from "./components/themeSwitcher";
import AddNewItem from "./components/addNewRow";
import { useNotification } from "./providers";

const getTableData = async (
  filters: {
    type: null | number;
    min_price: number | null;
    max_price: number | null;
  },
  page: number
) => {
  let help_obj = {
    page: page,
    filter_type: filters.type,
    filter_min_price: filters.min_price,
    filter_max_price: filters.max_price,
  };
  const res = await fetch(`/api/getTableData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(help_obj),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data..");
  }
  return res.json();
};

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

export default function Home() {
  const [page, setPage] = React.useState<number>(1);
  const [filterType, setFilterType] = React.useState<number | null>(null);
  const [filterMinPrice, setFilterMinPrice] = React.useState<number | null>(
    null
  );
  const [filterMaxPrice, setFilterMaxPrice] = React.useState<number | null>(
    null
  );

  const [priceSort, setPriceSort] = React.useState<string | null>(null); // "asc" / "desc"

  const [filters, setFilters] = React.useState<{
    type: null | number;
    min_price: number | null;
    max_price: number | null;
  }>({
    type: null,
    min_price: null,
    max_price: null,
  });

  const [delModalOpen, setDelModalOpen] = React.useState<boolean>(false);
  const [tempItemDel, setTempItemDel] = React.useState<null | Estate>(null);

  const [editModalOpen, setEditModalOpen] = React.useState<boolean>(false);
  const [tempItemEdit, setTempItemEdit] = React.useState<null | Estate>(null);

  const openNotification = useNotification();

  const setEstates = useEstateStore((state) => state.setEstates);
  const deleteEstate = useEstateStore((state) => state.deleteEstate);

  const {
    isLoading: table_load,
    isError: table_is_error,
    data: table_data,
    error: table_error,
  } = useQuery({
    queryKey: ["get_table", filters, page],
    queryFn: () => getTableData(filters, page),
  });

  React.useEffect(() => {
    if (table_data && table_data._embedded?.estates) {
      setEstates(table_data._embedded.estates);
    }
  }, [table_data]);

  const clickFilters = () => {
    setPriceSort(null);
    setFilters({
      type: filterType,
      max_price: filterMaxPrice,
      min_price: filterMinPrice,
    });
  };

  const estates = useEstateStore((state) => state.estates);

  const sortedEstates = React.useMemo(() => {
    if (!estates) return [];

    let sortedData = [...estates];

    if (priceSort === "asc") {
      sortedData.sort((a, b) => a.price_czk.value_raw - b.price_czk.value_raw);
    } else if (priceSort === "desc") {
      sortedData.sort((a, b) => b.price_czk.value_raw - a.price_czk.value_raw);
    }

    return sortedData;
  }, [estates, priceSort]);

  return (
    <div
      className="min-h-screen min-w-screen w-full h-full
                   flex flex-col
                  bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText
                  
                  "
    >
      {/* HAEDER */}
      <header className="w-full h-20 items-center justify-between dark:bg-darkHeader bg-lightHeader flex flex-row px-6">
        <div></div>
        <a className="text-zinc-50 text-xl">test app</a>
        <div className="">
          <ThemeSwitcher />
        </div>
      </header>
      <main
        className="flex-1 w-full h-full
                        flex flex-col p-8 items-center gap-6"
      >
        <div
          className="w-full flex items-center justify-evenly
        flex-col lg:flex-row 
        gap-4"
        >
          {/* Filters */}
          <div className=" min-w-[40vw] h-full border border-black bg-zinc-50 text-black flex flex-col gap-2 p-3 rounded-xl">
            <div className="flex flex-row">
              <span className="text-lg">Filter</span>
            </div>

            <div className="flex flex-row">
              <span className="w-24">Type</span>
              <span>
                <Select
                  className="w-36"
                  size="small"
                  value={filterType}
                  onChange={(val) => setFilterType(val)}
                  placeholder="Pronajem / Prodej"
                  options={[
                    {
                      label: <span>Prodej</span>,
                      value: 1,
                    },
                    {
                      label: <span>Pronajem</span>,
                      value: 2,
                    },
                  ]}
                ></Select>
              </span>
            </div>

            <div className="flex flex-row">
              <span className="w-24">Min price</span>
              <InputNumber
                disabled={true}
                className="w-36"
                size="small"
                min={0}
                max={filterMaxPrice != null ? filterMaxPrice : undefined}
                value={filterMinPrice}
                onChange={(val) => setFilterMinPrice(val)}
              ></InputNumber>
            </div>

            <div className="flex flex-row">
              <span className="w-24">Max price</span>
              <InputNumber
                disabled={true}
                className="w-36"
                size="small"
                min={filterMinPrice != null ? filterMinPrice : undefined}
                max={40000000}
                value={filterMaxPrice}
                onChange={(val) => setFilterMaxPrice(val)}
              ></InputNumber>
            </div>
            <div className="flex flex-row">
              <Button disabled={table_load} onClick={clickFilters}>
                {table_load ? "Loading.." : "Filter"}
              </Button>
            </div>
          </div>

          <div className=" min-w-[40vw] h-full border border-black bg-zinc-50 text-black flex flex-col gap-2 p-3 rounded-xl">
            <AddNewItem />
          </div>
        </div>
        {/**  TABLE*/}

        <div
          className="w-full h-full 
                        flex flex-col
                        border border-black overflow-hidden rounded-xl
                        divide-y divide-slate-600"
        >
          <div className="w-full flex items-center justify-center bg-slate-800">
            <span className="text-white py-2">Sreality table</span>
          </div>
          {
            /**  TABLE CONTENT*/

            table_load ? (
              <div className="w-full h-full p-6 flex flex-col gap-6">
                <Skeleton loading={table_load} active>
                  <List></List>
                </Skeleton>
              </div>
            ) : table_error || table_is_error ? (
              <div className="flex justify-center">
                <span className="italic">Failed to get data...</span>
              </div>
            ) : (
              <>
                {table_data._embedded &&
                table_data._embedded.estates &&
                table_data._embedded.estates.length > 0 ? (
                  <>
                    {" "}
                    <div className="grid grid-cols-30 divide-x divide-slate-600 bg-slate-400">
                      <span className="col-span-1 text-center p-1 flex  items-center justify-center">
                        Edit
                      </span>
                      <span className="col-span-1 text-center p-1 flex  items-center justify-center">
                        Del
                      </span>
                      <span className="col-span-2 text-center p-1 flex  items-center justify-center">
                        Typ
                      </span>

                      <span className="col-span-10 text-center p-1 flex items-center justify-center">
                        name
                      </span>
                      <span className="col-span-10 text-center p-1 flex items-center justify-center">
                        locality
                      </span>
                      <div className="col-span-6 p-1 flex flex-row items-center justify-between">
                        <div></div>
                        <a>price</a>
                        <div className="place-self-end flex flex-col">
                          <UpOutlined
                            onClick={() => {
                              if (priceSort == "asc") {
                                setPriceSort(null);
                              } else {
                                setPriceSort("asc");
                              }
                            }}
                            className={`p-1
                          ${priceSort == "asc" && "bg-slate-50"}
                          rounded-full hover:bg-slate-50 duration-300 ease-out transition-colors`}
                          />

                          <DownOutlined
                            onClick={() => {
                              if (priceSort == "desc") {
                                setPriceSort(null);
                              } else {
                                setPriceSort("desc");
                              }
                            }}
                            className={`p-1 
                           ${priceSort == "desc" && "bg-slate-50"}
                          rounded-full hover:bg-slate-50 duration-300 ease-out transition-colors`}
                          />
                        </div>
                      </div>
                    </div>
                    {sortedEstates.map((estate: Estate) => (
                      <SingleEstate
                        key={estate.hash_id}
                        estate={estate}
                        setDelModalOpen={setDelModalOpen}
                        setTempItemDel={setTempItemDel}
                        setEditModalOpen={setEditModalOpen}
                        setTempItemEdit={setTempItemEdit}
                      />
                    ))}
                  </>
                ) : (
                  <div>
                    <span className="italic">No estates listed yet</span>
                  </div>
                )}

                {/**  TABLE PAGINATION*/}
                <div className=" w-full flex items-center justify-center py-2">
                  <Pagination
                    showSizeChanger={false}
                    showQuickJumper={false}
                    total={300}
                    current={page}
                    onChange={(val) => setPage(val)}
                  />
                </div>
              </>
            )
          }
        </div>
      </main>
      {/** EDIT MODAL */}
      <EditModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        tempItemEdit={tempItemEdit}
        setTempItemEdit={setTempItemEdit}
      />

      {/** DEL MODAL */}
      <Modal
        title="Are you sure to delete this item?"
        className="w-[60vw] h-[50lvh]"
        open={delModalOpen}
        onCancel={() => {
          setDelModalOpen(false);
          setTempItemDel(null);
        }}
        onClose={() => {
          setDelModalOpen(false);
          setTempItemDel(null);
        }}
        onOk={() => {
          if (tempItemDel) {
            deleteEstate(tempItemDel.hash_id);
            openNotification(
              "Success",
              `${tempItemDel.name} has been deleted.`
            );
          }
          setTempItemDel(null);
          setDelModalOpen(false);
        }}
      >
        <div className="flex flex-row">
          <span>Item to delete: {tempItemDel?.name}</span>
        </div>
      </Modal>
    </div>
  );
}

function parsePrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function SingleEstate({
  estate,
  setDelModalOpen,
  setTempItemDel,
  setEditModalOpen,
  setTempItemEdit,
}: {
  estate: Estate;
  setDelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTempItemDel: React.Dispatch<React.SetStateAction<Estate | null>>;
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTempItemEdit: React.Dispatch<React.SetStateAction<Estate | null>>;
}) {
  return (
    <div className="grid grid-cols-30 divide-x divide-slate-600 bg-lightTableBg dark:bg-darkTableBg">
      <div className="col-span-1 p-1 flex items-center justify-center">
        <EditOutlined
          onClick={() => {
            setEditModalOpen(true);
            setTempItemEdit(estate);
          }}
          className="hover:bg-slate-300 duration-300 ease-out transition-colors
                      p-1 rounded-full"
        />
      </div>
      <div className="col-span-1 p-1 flex items-center justify-center">
        <DeleteOutlined
          onClick={() => {
            setDelModalOpen(true);
            setTempItemDel(estate);
          }}
          className="hover:bg-slate-300 duration-300 ease-out transition-colors
        p-1 rounded-full
        "
        />
      </div>
      <span className="col-span-2 p-1">
        {typeof estate.type == "number"
          ? estate.type == 1
            ? "Prodej"
            : estate.type == 2
            ? "Pronajem"
            : "-"
          : "-"}
      </span>

      <span className="col-span-10 p-1">{estate.name || "-"}</span>
      <span className="col-span-10 p-1">{estate.locality || "-"}</span>
      <span className="col-span-6 text-end p-1">
        {typeof estate.price_czk.value_raw === "number"
          ? `${parsePrice(estate.price_czk.value_raw)} ${
              estate.type == 1 ? "Czk" : "Czk/Month"
            } `
          : "-"}
      </span>
    </div>
  );
}

function EditModal({
  editModalOpen,
  setEditModalOpen,
  tempItemEdit,
  setTempItemEdit,
}: {
  editModalOpen: boolean;
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tempItemEdit: Estate | null;
  setTempItemEdit: React.Dispatch<React.SetStateAction<Estate | null>>;
}) {
  const [tempEditName, setTempEditName] = React.useState<string>("");
  const [tempEditLocation, setTempEditLocation] = React.useState<string>("");
  const [tempEditPrice, setTempEditPrice] = React.useState<number | null>(null);

  const openNotification = useNotification();
  const editEstate = useEstateStore((state) => state.editEstate);

  React.useEffect(() => {
    if (editModalOpen == true && tempItemEdit) {
      setTempEditName(tempItemEdit?.name);
      setTempEditLocation(tempItemEdit?.locality);
      setTempEditPrice(tempItemEdit?.price_czk.value_raw);
    }
  }, [editModalOpen]);

  const editBtnClick = () => {
    if (
      tempEditName != "" &&
      tempEditLocation != "" &&
      typeof tempEditPrice == "number" &&
      tempItemEdit
    ) {
      editEstate(tempItemEdit.hash_id, {
        name: tempEditName,
        locality: tempEditLocation,
        price_czk: { ...tempItemEdit.price_czk, value_raw: tempEditPrice },
      });
      openNotification("Success", "Item edited..");
      setTempItemEdit(null);
      setEditModalOpen(false);
    } else {
      openNotification("Error", "All values must be filled in");
    }
  };

  return (
    <Modal
      title="Are you sure to edi this modal?"
      className="w-[60vw] h-[50lvh]"
      open={editModalOpen}
      onCancel={() => {
        setEditModalOpen(false);
        setTempItemEdit(null);
      }}
      onClose={() => {
        setEditModalOpen(false);
        setTempItemEdit(null);
      }}
      onOk={editBtnClick}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <span>You are editing item id:</span>
          <span>{tempItemEdit?.hash_id}</span>
        </div>
        <div className="flex flex-row items-center">
          <span className="w-28">Name:</span>{" "}
          <Input
            placeholder="name"
            size="small"
            className="w-72"
            value={tempEditName}
            onChange={(e) => setTempEditName(e.target.value)}
          ></Input>
        </div>
        <div className="flex flex-row items-center">
          <span className="w-28">Location:</span>{" "}
          <Input.TextArea
            autoSize={true}
            placeholder="location"
            size="small"
            className="w-72"
            value={tempEditLocation}
            onChange={(e) => setTempEditLocation(e.target.value)}
          ></Input.TextArea>
        </div>
        <div className="flex flex-row items-center">
          <span className="w-28">Price:</span>{" "}
          <InputNumber
            placeholder="price"
            size="small"
            className="w-72"
            value={tempEditPrice}
            onChange={(val) => setTempEditPrice(val)}
          ></InputNumber>
        </div>
      </div>
    </Modal>
  );
}
