import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipContainerProps {
  arrow?: boolean;
  children: ReactNode;
  className?: string;
  arrowClassName?: string;
  placement?: TooltipPosition;
}

export function TooltipContainer({
  className,
  arrow = true,
  arrowClassName,
  placement = 'top',
  children,
}: TooltipContainerProps): ReactElement {
  return (
    <div
      data-popper-placement={placement}
      className={classNames(
        className,
        'relative flex items-center py-1 px-3 rounded-10 bg-theme-label-primary text-theme-label-invert typo-subhead',
      )}
    >
      {children}
      {arrow && (
        <div
          data-popper-arrow
          className={classNames(arrowClassName, 'bg-theme-label-primary')}
        />
      )}
    </div>
  );
}

export default TooltipContainer;
