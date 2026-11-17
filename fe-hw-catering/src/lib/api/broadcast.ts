const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const broadcastApi = {
    send: async (token: string, message: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/broadcast/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengirim broadcast');
        }

        return response.json();
    },
};
