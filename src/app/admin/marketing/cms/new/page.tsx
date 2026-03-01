import { MagazineForm } from "@/components/admin/MagazineForm";
import { createMagazinePost } from "../actions";

export const metadata = {
    title: "Crear Artículo | Admin Ruralpop"
};

export default function NewMagazinePostPage() {
    return (
        <MagazineForm
            actionPromise={async (formData) => {
                "use server";
                await createMagazinePost(formData);
            }}
        />
    );
}

// Memory Documentation:
// M1: Injected server actions into Client Component pattern via a prop promise binding. 
// M2: Guarantees secure transmission while avoiding form serialization bugs in CSR.
