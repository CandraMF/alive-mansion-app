'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';

export default function InitCart() {
  const { status } = useSession();
  const fetchCart = useCart(state => state.fetchCart);
  const isFetched = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && !isFetched.current) {

      fetchCart();
      isFetched.current = true;
    } else if (status === 'unauthenticated') {

      useCart.setState({ items: [] });
      isFetched.current = false;
    }
  }, [status, fetchCart]);

  return null;
}