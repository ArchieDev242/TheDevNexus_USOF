import Report from '../models/Report.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import notification_service from '../services/NotificationService.js';

// Submit a report
const submit_report = async (req, res) => {
    try 
    {
        const { reported_type, reported_id, reason } = req.body;
        const reporter_id = req.user.id;

        if(!reported_type || !reported_id || !reason) 
            {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        if(!['post', 'user', 'comment'].includes(reported_type)) 
            {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid reported type'
            });
        }

        const PREDEFINED_REASONS = ['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright'];
        const is_predefined_reason = PREDEFINED_REASONS.includes(reason);

        if(!is_predefined_reason && (reason.length < 10 || reason.length > 500)) 
            {
            return res.status(400).json({
                status: 'error',
                message: 'Custom reason must be between 10 and 500 characters'
            });
        }

        const is_duplicate = await Report.check_duplicate(reporter_id, reported_type, reported_id);
        if(is_duplicate) 
            {
            return res.status(400).json({
                status: 'error',
                message: 'You have already reported this content'
            });
        }

        if(reported_type === 'post') 
            {
            const post = await Post.find_by_id(reported_id);
            if(!post) 
                {
                return res.status(404).json({
                    status: 'error',
                    message: 'Post not found'
                });
            }
        } else if(reported_type === 'comment') 
            {
            const comment = await Comment.find_by_id(reported_id);
            if(!comment) 
                {
                return res.status(404).json({
                    status: 'error',
                    message: 'Comment not found'
                });
            }
        } else if(reported_type === 'user') 
            {
            const user = await User.find_by_id(reported_id);
            if(!user) 
                {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
        }

        // can't report yourself
        if(reported_type === 'user' && reported_id === reporter_id) 
            {
            return res.status(400).json({
                status: 'error',
                message: 'You cannot report yourself'
            });
        }

        // create report
        const report = await Report.create(reporter_id, reported_type, reported_id, reason);

        await notification_service.notify_admins_about_report({
            reportId: report.id,
            reportedType: reported_type,
            reportedId: reported_id,
            reason,
            reporter: {
                id: reporter_id,
                login: req.user?.login,
                full_name: req.user?.full_name
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Report submitted successfully',
            data: report
        });

    } catch(error) 
    {
        console.error('Error submitting report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit report'
        });
    }
};

// get all reports (admin only)
const get_reports = async (req, res) => {
    try 
    {
        if(req.user.role !== 'admin') 
            {
            return res.status(403).json({
                status: 'error',
                message: 'Only admins can view reports'
            });
        }

        const { status, reported_type, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const filter = {};
        if(status) filter.status = status;
        if(reported_type) filter.reported_type = reported_type;

        const [reports, total] = await Promise.all([
            Report.get_all(filter, parseInt(limit), offset),
            Report.get_count(status || null)
        ]);

        res.status(200).json({
            status: 'success',
            data: reports,
            pagination: 
            {
                page: parseInt(page),
                limit: parseInt(limit),
                total
            }
        });

    } catch(error) 
    {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch reports'
        });
    }
};

const get_report = async (req, res) => {
    try 
    {
        if(req.user.role !== 'admin') 
            {
            return res.status(403).json({
                status: 'error',
                message: 'Only admins can view reports'
            });
        }

        const { report_id } = req.params;

        const report = await Report.find_by_id(report_id);
        if(!report) 
            {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: report
        });

    } catch(error) 
    {
        console.error('Error fetching report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch report'
        });
    }
};

const resolve_report = async (req, res) => {
    try 
    {
        if(req.user.role !== 'admin') 
        {
            return res.status(403).json({
                status: 'error',
                message: 'Only admins can resolve reports'
            });
        }

        const { report_id } = req.params;
        const { status, admin_notes, action } = req.body;

        if(!['resolved', 'dismissed', 'rejected'].includes(status)) 
            {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status'
            });
        }

        const report = await Report.find_by_id(report_id);
        if(!report) 
            {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found'
            });
        }

        if(action === 'delete_content' && status === 'resolved') 
            {
            if(report.reported_type === 'post') 
                {
                const post = await Post.find_by_id(report.reported_id);
                if(post) await post.delete();
            } else if(report.reported_type === 'comment') 
                {
                const comment = await Comment.find_by_id(report.reported_id);
                if(comment) await comment.delete();
            }
        }

        if(action === 'ban_user' && status === 'resolved') 
        {
            if(report.reported_type === 'user') 
            {
                await User.ban(report.reported_id);
            } else if(report.reported_type === 'post' || report.reported_type === 'comment') 
            {
                const author_id = report.reported_author_id;
                if(author_id) await User.ban(author_id);
            }
        }

        const updated = await Report.update_status(report_id, status, admin_notes);

        if(updated) 
            {
            res.status(200).json({
                status: 'success',
                message: 'Report resolved successfully'
            });
        } else 
            {
            res.status(404).json({
                status: 'error',
                message: 'Report not found'
            });
        }

    } catch(error) 
    {
        console.error('Error resolving report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to resolve report'
        });
    }
};

const get_reports_count = async (req, res) => {
    try 
    {
        if(req.user.role !== 'admin') 
            {
            return res.status(403).json({
                status: 'error',
                message: 'Only admins can view reports'
            });
        }

        const pending = await Report.get_count('pending');
        const resolved = await Report.get_count('resolved');
        const dismissed = await Report.get_count('dismissed');
        const rejected = await Report.get_count('rejected');

        res.status(200).json({
            status: 'success',
            data: {
                pending,
                resolved,
                dismissed,
                rejected,
                total: pending + resolved + dismissed + rejected
            }
        });

    } catch(error) 
    {
        console.error('Error fetching reports count:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch reports count'
        });
    }
};

const get_reports_for_content = async (req, res) => {
    try 
    {
        const { reported_type, reported_id } = req.params;

        const reports = await Report.get_by_reported(reported_type, reported_id);

        res.status(200).json({
            status: 'success',
            data: reports
        });

    } catch(error) 
    {
        console.error('Error fetching content reports:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch content reports'
        });
    }
};

export default {
    submit_report,
    get_reports,
    get_report,
    resolve_report,
    get_reports_count,
    get_reports_for_content
};
