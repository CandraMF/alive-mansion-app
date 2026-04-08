export const products = [
    {
        id: '1',
        name: 'Work Jacket 2.0',
        price: 'IDR 850.000',
        images: [
            'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1200&auto=format&fit=crop'
        ],
        status: 'available',
        description: 'Constructed from a durable 14oz cotton canvas. Features a boxy fit, dropped shoulders, a heavy-duty zipper, and corduroy collar detailing.',
        // Data ukuran dan ketersediaan stok
        sizes: [
            { size: 'S', available: true },
            { size: 'M', available: true },
            { size: 'L', available: false }, // Contoh: Ukuran L Sold Out
            { size: 'XL', available: true }
        ]
    },
    {
        id: '2',
        name: 'Mankind Graphic Tee',
        price: 'IDR 350.000',
        images: [
            'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'
        ],
        status: 'available',
        description: 'Custom milled 200gsm cotton.',
        sizes: [
            { size: 'S', available: false },
            { size: 'M', available: false },
            { size: 'L', available: true },
            { size: 'XL', available: true }
        ]
    },
    {
        id: '3',
        name: 'Saunter Crewneck',
        price: 'IDR 450.000',
        images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop'
        ],
        status: 'sold_out',
        description: 'Boxy fit with dropped shoulders.',
        sizes: [
            { size: 'S', available: false },
            { size: 'M', available: false },
            { size: 'L', available: false },
            { size: 'XL', available: false }
        ]
    },
    {
        id: '4',
        name: 'Pleated Trousers',
        price: 'IDR 600.000',
        images: [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619134711684-60c04a08866a?q=80&w=800&auto=format&fit=crop'
        ],
        status: 'available',
        description: 'Lightweight twill blend.',
        sizes: [
            { size: 'S', available: true },
            { size: 'M', available: true },
            { size: 'L', available: true },
            { size: 'XL', available: false }
        ]
    }
];