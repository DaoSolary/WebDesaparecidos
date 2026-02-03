import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { hasAnyRole } from '../utils/roles';
export function ProtectedRoute({ children, allowedRoles = [], redirectTo = '/entrar' }) {
    const { user } = useAuth();
    if (!user) {
        return _jsx(Navigate, { to: redirectTo, replace: true });
    }
    if (allowedRoles.length > 0 && !hasAnyRole(user.role, allowedRoles)) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
