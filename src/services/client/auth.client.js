import { storage, STORAGE_KEYS } from "@/lib/storage";
import { ROLES } from "@/config/roles";

/**
 * Auth service.
 *
 * MOCK IMPLEMENTATION (localStorage) – NOT secure, for UI development only.
 * Swap every method for `backendApi.post("/auth/login")` etc. and move the
 * session into an httpOnly cookie. The method signatures are the contract the
 * <AuthProvider /> relies on.
 */

const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));
const encode = (s) => (typeof btoa === "function" ? btoa(unescape(encodeURIComponent(s))) : s);

export class AuthError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

const publicUser = ({ passwordHash, ...user }) => user;

export const authService = {
  getSession() {
    return storage.get(STORAGE_KEYS.session, null);
  },

  async register({ name, email, phone, password }) {
    await wait();
    const users = storage.get(STORAGE_KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new AuthError("An account with this email already exists.", "email");
    }
    const user = {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      name,
      email,
      phone: phone ?? "",
      role: ROLES.customer,
      passwordHash: encode(password),
      createdAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.users, [...users, user]);
    const session = { user: publicUser(user) };
    storage.set(STORAGE_KEYS.session, session);
    return session;
  },

  async login({ email, password }) {
    await wait();
    const users = storage.get(STORAGE_KEYS.users, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== encode(password)) {
      throw new AuthError("Incorrect email or password.", "password");
    }
    const session = { user: publicUser(user) };
    storage.set(STORAGE_KEYS.session, session);
    return session;
  },

  async logout() {
    await wait(150);
    storage.remove(STORAGE_KEYS.session);
  },

  async requestPasswordReset({ email }) {
    await wait();
    // Always resolve – never reveal whether an email exists.
    return { email };
  },

  async updateProfile(patch) {
    await wait(300);
    const session = this.getSession();
    if (!session) throw new AuthError("You are not signed in.");
    const users = storage.get(STORAGE_KEYS.users, []);
    const updatedUsers = users.map((u) => (u.id === session.user.id ? { ...u, ...patch } : u));
    storage.set(STORAGE_KEYS.users, updatedUsers);
    const next = { user: { ...session.user, ...patch } };
    storage.set(STORAGE_KEYS.session, next);
    return next;
  },
};
