import React, { useEffect, useState } from "react";
import { CToaster, CToast, CToastBody, CToastHeader } from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import { selectToasts, removeToast } from "../store/toastSlice";

const formatTimeAgo = (timestamp) => {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
	if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
	return `${days} day${days !== 1 ? "s" : ""} ago`;
};

export const Toaster = () => {
	const toasts = useSelector(selectToasts);
	const dispatch = useDispatch();
	const [toastsWithTimeAgo, setToastsWithTimeAgo] = useState(toasts);

	useEffect(() => {
		// Update timeAgo every minute
		const interval = setInterval(() => {
			setToastsWithTimeAgo(
				toasts.map((toast) => ({
					...toast,
					timeAgo: formatTimeAgo(toast.timestamp),
				}))
			);
		}, 60000); // Update every minute

		// Initial update when the component first mounts
		setToastsWithTimeAgo(
			toasts.map((toast) => ({
				...toast,
				timeAgo: formatTimeAgo(toast.timestamp),
			}))
		);

		return () => clearInterval(interval); // Cleanup on unmount
	}, [toasts]);

	useEffect(() => {
		// Remove toast after 3 seconds
		if (toastsWithTimeAgo.length > 0) {
			const timer = setTimeout(() => {
				const lastToast =
					toastsWithTimeAgo[toastsWithTimeAgo.length - 1];
				dispatch(removeToast(lastToast.id));
			}, 10000);


			return () => clearTimeout(timer);
		}
	}, [toastsWithTimeAgo, dispatch]);

	return (
		<>
			<CToaster className="p-3" placement="top-end">
				{toastsWithTimeAgo.map((toast) => (
					<CToast key={toast.id} visible={true} autohide={false}>
						<CToastHeader closeButton>
							<svg
								className="rounded me-2"
								width="20"
								height="20"
								xmlns="http://www.w3.org/2000/svg"
								preserveAspectRatio="xMidYMid slice"
								focusable="false"
								role="img">
								<rect
									width="100%"
									height="100%"
									fill={toast.color}></rect>
							</svg>
							<div className="fw-bold me-auto">{toast.title}</div>
							<small>{toast.timeAgo}</small>
						</CToastHeader>
						<CToastBody>{toast.message}</CToastBody>
					</CToast>
				))}
			</CToaster>
		</>
	);
};