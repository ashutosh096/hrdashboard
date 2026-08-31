import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

export function requireRole(...allowedRoles: Array<'ADMIN' | 'MANAGER' | 'EMPLOYEE'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (allowedRoles.includes(req.user.role) || req.user.role === 'ADMIN') {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions for this resource' });
  };
}

export function requireTeamScope(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin has cross-team scope
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Manager is scoped to their managedTeamId
  if (req.user.role === 'MANAGER') {
    // Attached parameters for downstream query builders
    (req as any).teamScopeId = req.user.managedTeamId || req.user.employeeId;
    return next();
  }

  // Employee is scoped strictly to self
  (req as any).employeeSelfId = req.user.employeeId;
  next();
}
