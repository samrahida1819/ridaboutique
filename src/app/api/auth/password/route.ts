import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/admin-api-server";
import {
  createSupabaseServerAuthClient,
  getSupabaseServerConfigError,
  getSupabaseServiceRoleClient,
  hasSupabaseServerConfig,
  hasSupabaseServiceRoleConfig
} from "@/lib/supabase-server";

const ADMIN_ON_CUSTOMER_LOGIN_ERROR =
  "This is an admin account. Please use the Admin login at /dashboard/login.";

type SignupBody = {
  action: "signup";
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

type LoginBody = {
  action: "login";
  email: string;
  password: string;
};

type PasswordBody = SignupBody | LoginBody;

function isEmailNotConfirmed(message: string) {
  return message.toLowerCase().includes("email not confirmed");
}

async function findAuthUserIdByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const admin = getSupabaseServiceRoleClient();

  const { data: profile } = await admin.from("profiles").select("id").ilike("email", email.trim()).maybeSingle();
  if (profile?.id) {
    return profile.id;
  }

  let page = 1;
  while (page <= 5) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) {
      break;
    }

    const user = data.users.find((entry) => entry.email?.toLowerCase() === normalized);
    if (user?.id) {
      return user.id;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function confirmAuthUser(
  userId: string,
  updates?: { password?: string; fullName?: string; phone?: string | null }
) {
  const admin = getSupabaseServiceRoleClient();
  return admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
    ...(updates?.password ? { password: updates.password } : {}),
    ...(updates?.fullName || updates?.phone !== undefined
      ? {
          user_metadata: {
            ...(updates.fullName ? { full_name: updates.fullName } : {}),
            ...(updates.phone !== undefined ? { phone: updates.phone } : {})
          }
        }
      : {})
  });
}

async function signInAndRespond(email: string, password: string) {
  const supabase = createSupabaseServerAuthClient();
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error && isEmailNotConfirmed(error.message) && hasSupabaseServiceRoleConfig()) {
    const userId = await findAuthUserIdByEmail(email);
    if (userId) {
      await confirmAuthUser(userId);
      ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
    }
  }

  if (error || !data.session || !data.user) {
    return jsonError(error?.message || "Invalid email or password.", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return jsonError(profileError.message, 500);
  }

  if (profile?.role === "admin") {
    await supabase.auth.signOut().catch(() => null);
    return jsonError(ADMIN_ON_CUSTOMER_LOGIN_ERROR, 403);
  }

  return NextResponse.json({
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at
    },
    user: { id: data.user.id, email: data.user.email }
  });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return jsonError(getSupabaseServerConfigError() || "Supabase backend env is missing.", 503);
  }

  const body = (await request.json().catch(() => null)) as PasswordBody | null;
  const email = body?.email?.trim();
  const password = body?.password || "";

  if (!body?.action || !email || !password) {
    return jsonError("Email and password are required.", 400);
  }

  if (password.length < 6) {
    return jsonError("Password must be at least 6 characters.", 400);
  }

  if (body.action === "login") {
    return signInAndRespond(email, password);
  }

  if (body.action !== "signup") {
    return jsonError("Invalid auth request.", 400);
  }

  const fullName = body.fullName?.trim();
  if (!fullName) {
    return jsonError("Full name is required.", 400);
  }

  const phone = body.phone?.trim() || null;

  if (hasSupabaseServiceRoleConfig()) {
    const admin = getSupabaseServiceRoleClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone }
    });

    if (createError) {
      const message = createError.message.toLowerCase();
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        const userId = await findAuthUserIdByEmail(email);
        if (!userId) {
          return jsonError("An account with this email already exists. Try logging in.", 400);
        }

        const { error: updateError } = await confirmAuthUser(userId, { password, fullName, phone });
        if (updateError) {
          return jsonError(updateError.message, 400);
        }
      } else {
        return jsonError(createError.message, 400);
      }
    }

    const userId = created.user?.id || (await findAuthUserIdByEmail(email));
    if (userId) {
      await admin.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        role: "customer"
      });
    }
  } else {
    const supabase = createSupabaseServerAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } }
    });

    if (error) {
      return jsonError(error.message, 400);
    }

    if (!data.session && data.user) {
      return jsonError(
        "Add SUPABASE_SERVICE_ROLE_KEY on Vercel, or turn off Confirm email in Supabase → Authentication → Providers → Email.",
        400
      );
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role: "customer"
      });
    }

    if (data.session && data.user) {
      return NextResponse.json({
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
        },
        user: { id: data.user.id, email: data.user.email }
      });
    }
  }

  return signInAndRespond(email, password);
}
