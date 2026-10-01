export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt?: string;
}
