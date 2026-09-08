import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("\n❌ Missing configuration in .env:");
  if (!supabaseUrl) console.error(" - SUPABASE_URL (or VITE_SUPABASE_URL)");
  if (!serviceRoleKey) console.error(" - SUPABASE_SERVICE_ROLE_KEY (Get this from Supabase Dashboard -> Project Settings -> API)");
  console.error("\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env file and try again.\n");
  process.exit(1);
}

const email = process.argv[2] || "admin@visa-seva.local";
const password = process.argv[3] || "Admin@123456";
const role = process.argv[4] || "decision_maker";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`\n⏳ Setting up admin user: ${email}...`);

  // Check if user exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("❌ Failed to query users:", listError.message);
    process.exit(1);
  }

  const existing = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  let userId;

  if (existing) {
    console.log(`ℹ️ User already exists (${existing.id}), updating password...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
      existing.id,
      { password, email_confirm: true }
    );
    if (updateError) {
      console.error("❌ Failed to update user:", updateError.message);
      process.exit(1);
    }
    userId = updated.user.id;
  } else {
    console.log("ℹ️ Creating new user in auth.users...");
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      console.error("❌ Failed to create user:", createError.message);
      process.exit(1);
    }
    userId = created.user.id;
  }

  // Assign role in platform_roles table
  console.log(`ℹ️ Assigning role '${role}' in platform_roles...`);
  const { error: roleError } = await supabase
    .from("platform_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" });

  if (roleError) {
    console.error("❌ Failed to assign platform role:", roleError.message);
    process.exit(1);
  }

  console.log("\n========================================================");
  console.log("✅ Admin Account Successfully Created / Updated!");
  console.log("========================================================");
  console.log(` Portal URL : http://admin.localhost:5173`);
  console.log(` Email      : ${email}`);
  console.log(` Password   : ${password}`);
  console.log(` Role       : ${role}`);
  console.log("========================================================\n");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
