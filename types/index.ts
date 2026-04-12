// types/index.ts

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { name: string } | null;
};

export type Color = {
  id: string;
  name: string;
  hexCodes: string[];
};

export type Size = {
  id: string;
  name: string;
  sortOrder: number;
};

// Kita sekalian buat untuk Product agar nanti siap digunakan
export type ProductImage = {
  id: string;
  url: string;
  category: "MAIN" | "WITH_MODEL" | "DETAIL";
  position: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  categoryId: string | null;
  category?: Category | null;
  images: ProductImage[];
};