import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zrpucbuvojskcwrhwevv.supabase.co',
    'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function resetPassword() {
    const email = 'info@musguilla.com';
    const newPassword = 'Izzy@7789';

    console.log(`🔍 Buscando usuario: ${email}...`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listando usuarios:', listError.message);
        return;
    }

    let user = users.find(u => u.email === email);

    if (!user) {
        console.log(`💡 El usuario no existe. Creándolo...`);
        const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: newPassword,
            email_confirm: true,
            user_metadata: { name: 'Admin' }
        });

        if (createError) {
            console.error('❌ Error creando usuario:', createError.message);
            return;
        }
        user = newUser;
        console.log(`✅ Usuario creado (ID: ${user.id}).`);
    } else {
        console.log(`✅ Usuario encontrado (ID: ${user.id}). Actualizando contraseña...`);

        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('❌ Error actualizando contraseña:', updateError.message);
            return;
        }
    }

    // Asegurar que el usuario sea admin en la tabla 'users'
    console.log(`🛠️ Asignando rol 'admin' en la tabla 'users'...`);
    const { error: dbError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            email: email,
            name: 'Admin Ruralpop',
            role: 'admin'
        }, { onConflict: 'id' });

    if (dbError) {
        console.error('❌ Error en base de datos:', dbError.message);
    } else {
        console.log(`🎉 TODO LISTO. Usuario ${email} tiene acceso admin.`);
        console.log('Contraseña: Izzy@7789');
    }
}

resetPassword().catch(console.error);
