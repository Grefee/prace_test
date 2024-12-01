import { create } from 'zustand';

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

interface EstateStore {
  estates: Estate[];
  setEstates: (newEstates: Estate[]) => void;
  addEstate: (estate: Estate) => void;
  editEstate: (hash_id: number, updatedEstate: Partial<Estate>) => void;
  deleteEstate: (hash_id: number) => void;
}

export const useEstateStore = create<EstateStore>((set) => ({
  estates: [],
  setEstates: (newEstates) => set({ estates: newEstates }),
  addEstate: (estate) =>
    set((state) => ({ estates: [...state.estates, estate] })),
  editEstate: (hash_id, updatedEstate) =>
    set((state) => ({
      estates: state.estates.map((estate) =>
        estate.hash_id === hash_id
          ? { ...estate, ...updatedEstate }
          : estate
      ),
    })),
  deleteEstate: (hash_id) =>
    set((state) => ({
      estates: state.estates.filter((estate) => estate.hash_id !== hash_id),
    })),
}));