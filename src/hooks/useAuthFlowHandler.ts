/**
 * useAuthFlowHandler.ts — Auth Callback Interceptor (Hardened FSM Gate)
 *
 * RULES:
 *  - Must only execute when AUTH_STATUS = READY.
 *  - Must parse flow type deterministically: INVITE, PASSWORD_RECOVERY, LOGIN, OAUTH.
 *  - Output must be deterministic route assignment.
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { logAuthTransition } from '../auth/authClient';

export type AuthFlowType =
  | 'PASSWORD_RECOVERY'  // User clicked "forgot password" email link
  | 'INVITE'             // Admin invite — first login / set password
  | 'OAUTH'              // OAuth redirect callback
  | 'LOGIN'              // Valid login redirection
  | 'NONE';              // No redirection required

export const useAuthFlowHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus, user } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    // RULE: must only execute when AUTH_STATUS = READY
    if (authStatus !== 'ready') {
      logAuthTransition('FLOW_HANDLER_WAITING', { authStatus });
      return;
    }

    if (handled.current) return;

    const url = new URL(window.location.href);
    const hash = url.hash;
    const hashParams = new URLSearchParams(hash.replace('#', ''));

    // Detect flow type deterministically
    let flowType: AuthFlowType = 'NONE';

    const type = hashParams.get('type') || url.searchParams.get('type');
    if (type === 'recovery') {
      flowType = 'PASSWORD_RECOVERY';
    } else if (type === 'invite' || hash.includes('access_token')) {
      flowType = 'INVITE';
    } else if (url.searchParams.get('code')) {
      flowType = 'OAUTH';
    } else if (user) {
      // If we are logged in, and we are currently on the login screen, route to admin
      if (location.pathname === '/secure-admin-login') {
        flowType = 'LOGIN';
      }
    }

    if (flowType === 'NONE') {
      return;
    }

    handled.current = true;
    logAuthTransition('FLOW_HANDLER_MATCH', { flowType, path: location.pathname });

    switch (flowType) {
      case 'PASSWORD_RECOVERY':
        logAuthTransition('FLOW_HANDLER_REDIRECT', { from: location.pathname, to: '/set-password', flow: 'reset' });
        navigate('/set-password', { replace: true, state: { flow: 'reset' } });
        break;

      case 'INVITE':
        logAuthTransition('FLOW_HANDLER_REDIRECT', { from: location.pathname, to: '/set-password', flow: 'invite' });
        navigate('/set-password', { replace: true, state: { flow: 'invite' } });
        break;

      case 'OAUTH':
        logAuthTransition('FLOW_HANDLER_REDIRECT', { from: location.pathname, to: '/admin' });
        navigate('/admin', { replace: true });
        break;

      case 'LOGIN':
        logAuthTransition('FLOW_HANDLER_REDIRECT', { from: location.pathname, to: '/admin' });
        navigate('/admin', { replace: true });
        break;

      default:
        break;
    }
  }, [authStatus, user, navigate, location.pathname]);
};
