import React, { useState } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import '../ReportModal/report-modal.css';

const REPORT_REASONS = {
	spam: 'Спам',
	harassment: 'Агресія/Переслідування',
	inappropriate: 'Неналежний контент',
	misinformation: 'Дезінформація',
	copyright: 'Порушення авторських прав',
	other: 'Інше'
};

const ReportModal = ({ isOpen = true, onClose, targetType, targetId, targetTitle, onSubmit }) => {
	const [selected_reason, set_selected_reason] = useState('');
	const [custom_reason, set_custom_reason] = useState('');
	const [loading, set_loading] = useState(false);
	const [error, set_error] = useState('');

	const handle_submit = async (e) => {
		e.preventDefault();
        
		if(!selected_reason) 
			{
			set_error('Виберіть причину звіту');
			return;
		}

		let final_reason = selected_reason;
        
		if(selected_reason === 'other') 
			{
			if(custom_reason.trim().length < 10) 
				{
				set_error('Будь ласка, опишіть причину (мінімум 10 символів)');
				return;
			}

			if(custom_reason.trim().length > 500) 
				{
				set_error('Опис не повинен перевищувати 500 символів');
				return;
			}

			final_reason = custom_reason.trim();
		}

		set_loading(true);
		set_error('');

		try 
		{
			const response = await fetch('/api/reports', {
				method: 'POST',
				headers: 
				{
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					reported_type: targetType,
					reported_id: targetId,
					reason: final_reason
				})
			});

			const data = await response.json();

			if(!response.ok) throw new Error(data.message || 'Помилка при подачі звіту');

			if(onSubmit) onSubmit();

			set_selected_reason('');
			set_custom_reason('');
			onClose();

		} catch(err) 
		{
			set_error(err.message || 'Помилка при подачі звіту');
		} finally 
		{
			set_loading(false);
		}
	};

	const handle_close = () => {
		set_selected_reason('');
		set_custom_reason('');
		set_error('');
		onClose();
	};

	if(!isOpen) return null;

	return (
		<div className = "report-modal-overlay" onClick = {handle_close}>
			<div className = "report-modal" onClick = {(e) => e.stopPropagation()}>
				<div className = "report-modal-header">
					<h2>Подати звіт</h2>
					<button className = "report-modal-close" onClick = {handle_close}>
						<FiX size = {24} />
					</button>
				</div>

				<div className = "report-modal-body">
					<div className = "report-info">
						<FiAlertCircle size = {20} />
						<div>
							<p className = "report-target-type">
								Тип: <strong>{
									targetType === 'post' ? 'Пост' :
									targetType === 'comment' ? 'Коментар' :
									'Користувач'
								}</strong>
							</p>
							{targetTitle && (
								<p className = "report-target-title">
									"{targetTitle.substring(0, 50)}{targetTitle.length > 50 ? '...' : ''}"
								</p>
							)}
						</div>
					</div>

					<form onSubmit = {handle_submit}>
						<div className = "form-group">
							<label htmlFor = "reason">Причина звіту *</label>
							<select
								id = "reason"
								value = {selected_reason}
								onChange = {(e) => {
									set_selected_reason(e.target.value);
									set_custom_reason('');
									set_error('');
								}}
								className = "reason-select"
								disabled = {loading}
							>
								<option value="">Виберіть причину...</option>
								{Object.entries(REPORT_REASONS).map(([key, label]) => (
									<option key={key} value={key}>{label}</option>
								))}
							</select>
						</div>

						{selected_reason === 'other' && (
							<div className = "form-group">
								<label htmlFor = "customReason">Опишіть причину *</label>
								<textarea
									id = "customReason"
									value = {custom_reason}
									onChange = {(e) => set_custom_reason(e.target.value)}
									placeholder = "Опишіть причину звіту (мінімум 10, максимум 500 символів)..."
									rows = "5"
									disabled = {loading}
								/>
								<div className = "textarea-counter">
									{custom_reason.length}/500
								</div>
							</div>
						)}

						{error && (
							<div className = "report-error">
								{error}
							</div>
						)}

						<div className = "report-modal-actions">
							<button
								type = "button"
								className = "btn btn-secondary"
								onClick = {handle_close}
								disabled = {loading}
							>
								Скасувати
							</button>
							<button
								type = "submit"
								className = "btn btn-primary"
								disabled = {loading || !selected_reason || (selected_reason === 'other' && custom_reason.trim().length < 10)}
							>
								{loading ? 'Надсилання...' : 'Подати звіт'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ReportModal;
