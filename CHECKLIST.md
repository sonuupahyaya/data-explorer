# Production Launch Checklist

Complete checklist for deploying to production.

## Pre-Launch (1-2 weeks before)

- [ ] Code review complete
- [ ] All tests passing (`npm test` in both folders)
- [ ] No console errors or warnings
- [ ] Performance optimized (check Lighthouse score)
- [ ] Security audit complete
- [ ] Dependencies updated to latest stable versions
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations tested

## Infrastructure Setup (3-5 days before)

### MongoDB Atlas
- [ ] Create MongoDB Atlas account
- [ ] Create production cluster (M5 or higher)
- [ ] Create database user with strong password
- [ ] Configure IP whitelist (production servers only)
- [ ] Enable automated backups (daily)
- [ ] Enable authentication and encryption
- [ ] Set up monitoring alerts
- [ ] Get connection string

### Backend (Render.com or Railway)
- [ ] Create account
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set resource limits (memory, CPU)
- [ ] Configure auto-scaling if available
- [ ] Enable monitoring and logs
- [ ] Set up error tracking (Sentry)
- [ ] Configure health checks
- [ ] Get production URL

### Frontend (Vercel)
- [ ] Create account
- [ ] Import repository
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Enable analytics
- [ ] Configure redirects/rewrites if needed
- [ ] Set up preview deployments
- [ ] Get production URL

## Configuration & Security (3-5 days before)

### Environment Variables
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update `API_URL` to production API URL
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Set `NODE_ENV=production`
- [ ] Use strong MongoDB password
- [ ] Update database name if needed

### Security
- [ ] Remove all console.log debugging statements
- [ ] Disable source maps in production
- [ ] Enable HTTPS/SSL everywhere
- [ ] Configure security headers (Helmet.js)
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Validate all user inputs
- [ ] Use parameterized database queries
- [ ] Enable MongoDB authentication
- [ ] Remove any hardcoded credentials

### Monitoring & Logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation (CloudWatch, Papertrail)
- [ ] Set up performance monitoring
- [ ] Configure database monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alert thresholds
- [ ] Test alert notifications

## Testing (2-3 days before)

### Functional Testing
- [ ] Test navigation endpoints
- [ ] Test product browsing
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test sorting
- [ ] Test API responses
- [ ] Test error handling
- [ ] Test 404 pages

### Performance Testing
- [ ] Load test API (1000+ concurrent users)
- [ ] Test database query performance
- [ ] Test image loading performance
- [ ] Test pagination with large datasets
- [ ] Check page load speed (Lighthouse: 90+)
- [ ] Monitor memory usage
- [ ] Test cache invalidation

### Security Testing
- [ ] Test CORS headers
- [ ] Test rate limiting
- [ ] Test input validation
- [ ] Test SQL injection prevention
- [ ] Test XSS protection
- [ ] Test CSRF protection
- [ ] Verify no secrets in code/logs
- [ ] Test SSL/TLS certificate

### Compatibility Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile browsers
- [ ] Test on tablet
- [ ] Test keyboard navigation (a11y)
- [ ] Test screen readers

## Documentation (1-2 days before)

- [ ] Update README with production URLs
- [ ] Update API_DOCS.md with production endpoints
- [ ] Document deployment process
- [ ] Document backup procedures
- [ ] Document rollback procedures
- [ ] Document scaling procedures
- [ ] Create runbook for common issues
- [ ] Document team contact info
- [ ] Document monitoring access
- [ ] Update status page

## Deployment Preparation (1 day before)

### Backup & Recovery
- [ ] Full database backup created
- [ ] Backup tested and verified
- [ ] Recovery procedure documented
- [ ] Rollback plan documented
- [ ] Previous version ready to rollback
- [ ] DNS failover configured (optional)

### Communication
- [ ] Notify team of launch time
- [ ] Prepare launch announcement
- [ ] Set up war room (Slack channel)
- [ ] Assign deployment lead
- [ ] Assign monitoring lead
- [ ] Prepare status page updates

### Final Checks
- [ ] All code merged to main branch
- [ ] All tests passing on main
- [ ] GitHub Actions CI passing
- [ ] Docker images built successfully
- [ ] Environment variables verified
- [ ] Database connection tested
- [ ] API health check passing
- [ ] Frontend builds successfully

## Launch Day (Go Live)

### T-0 (Before Launch)
- [ ] Verify all team members present
- [ ] Verify monitoring dashboards online
- [ ] Verify alert systems armed
- [ ] Do final backup
- [ ] Verify rollback procedure ready
- [ ] Document start time

### T-1 (During Launch)
- [ ] Deploy backend to production
- [ ] Verify backend health check
- [ ] Deploy frontend to production
- [ ] Verify frontend loads
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Check user feedback channels

### T-2 (Post Launch - First Hour)
- [ ] Monitor for errors
- [ ] Monitor for performance issues
- [ ] Verify all endpoints responding
- [ ] Check database performance
- [ ] Verify images loading correctly
- [ ] Test on various devices/browsers
- [ ] Review analytics data
- [ ] Check external integrations

### T-3 (First 24 Hours)
- [ ] Continue monitoring
- [ ] Review user feedback
- [ ] Check analytics for issues
- [ ] Monitor error rates
- [ ] Monitor page load times
- [ ] Monitor database queries
- [ ] Monitor API response times
- [ ] Check for any security alerts

## Post-Launch (After 24 hours)

### Immediate (First Week)
- [ ] Bug fixes deployed as needed
- [ ] Performance optimizations if needed
- [ ] Monitor error rates (target: <0.1%)
- [ ] Monitor page load speed (target: <3s)
- [ ] Monitor API response time (target: <500ms)
- [ ] Daily backup verification
- [ ] Review user feedback

### Weekly
- [ ] Check monitoring dashboards
- [ ] Review error logs
- [ ] Review performance metrics
- [ ] Check database performance
- [ ] Review security logs
- [ ] Update documentation
- [ ] Plan next release

### Monthly
- [ ] Performance review
- [ ] Security audit
- [ ] Database optimization
- [ ] Dependency updates
- [ ] Capacity planning
- [ ] Cost review
- [ ] Team retrospective

## Monitoring & Alerts

### Key Metrics to Monitor
- [ ] API response time (p95, p99)
- [ ] Error rate (target: <0.1%)
- [ ] Database query time
- [ ] Frontend Lighthouse score
- [ ] Page load time (p95)
- [ ] CPU usage (target: <70%)
- [ ] Memory usage (target: <80%)
- [ ] Disk space
- [ ] Network bandwidth

### Alert Thresholds
- [ ] Error rate > 1% = Critical
- [ ] Response time > 2s = Warning
- [ ] Database query > 1s = Warning
- [ ] CPU > 85% = Warning
- [ ] Memory > 90% = Warning
- [ ] Disk space < 10% = Critical

## Rollback Procedure

If critical issues occur:

1. [ ] Declare incident
2. [ ] Gather logs and metrics
3. [ ] Assess severity
4. [ ] Decide to rollback or hotfix
5. [ ] Execute rollback:
   - [ ] Revert backend deployment
   - [ ] Revert frontend deployment
   - [ ] Restore from backup if needed
   - [ ] Verify system health
6. [ ] Communicate to users
7. [ ] Post-mortem analysis

## Success Criteria

- [ ] All endpoints responding
- [ ] Error rate < 0.5%
- [ ] Response time < 1s
- [ ] Page load time < 3s
- [ ] No security alerts
- [ ] Users able to browse products
- [ ] Search functionality working
- [ ] Database performing well
- [ ] All alerts functioning
- [ ] Monitoring dashboards accurate

## Post-Launch Documentation

- [ ] Update runbook
- [ ] Document any workarounds
- [ ] Update architecture diagram if changed
- [ ] Document lessons learned
- [ ] Schedule post-mortem
- [ ] Plan improvements

## Sign-Off

- [ ] Project Manager: ____________________ Date: ____
- [ ] Tech Lead: ____________________ Date: ____
- [ ] DevOps Lead: ____________________ Date: ____
- [ ] QA Lead: ____________________ Date: ____

## Contact Info (During Launch)

| Role | Name | Phone | Slack |
|------|------|-------|-------|
| Launch Lead | | | |
| Tech Lead | | | |
| DevOps | | | |
| QA | | | |
| PM | | | |

---

**Last Updated:** 2024-01-10

Remember: Launch is not the end, it's the beginning. Monitor, support, and iterate based on real user feedback.
