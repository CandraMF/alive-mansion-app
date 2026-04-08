'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (confirmDelete) {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          router.refresh(); // Segarkan data tabel tanpa reload halaman
        } else {
          alert("Failed to delete product");
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 disabled:text-gray-400`}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}