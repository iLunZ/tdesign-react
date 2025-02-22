import React, { ReactNode, useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { StyledProps } from '../common';
import useSwitch from '../_util/useSwitch';
import useAnimation from '../_util/useAnimation';
import Portal from '../common/Portal';
import useConfig from '../hooks/useConfig';
import getPosition from '../_common/js/utils/getPosition';
import { TdTooltipLiteProps } from './type';
import { tooltipLiteDefaultProps } from './defaultProps';
import { getTransitionParams } from '../popup/utils/transition';

export interface TooltipLiteProps extends TdTooltipLiteProps, StyledProps {
  children?: ReactNode;
}

const DEFAULT_TRANSITION_TIMEOUT = 180;

const TooltipLite: React.FC<TooltipLiteProps> = (props) => {
  const { style, className, placement, showArrow, theme, children, triggerElement, content, showShadow } = props;
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const popupRef = useRef(null);
  const { classPrefix } = useConfig();
  const [hover, hoverAction] = useSwitch();
  const [position, setPosition] = useState(null);
  const { keepFade } = useAnimation();

  useEffect(() => {
    if (triggerRef.current && contentRef.current) {
      setPosition(getPosition(triggerRef.current, contentRef.current, placement));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRef.current, contentRef.current, placement, hover]);

  const getTriggerChildren = (children) => {
    const appendProps = {
      ref: triggerRef,
      onMouseEnter: hoverAction.on,
      onMouseLeave: hoverAction.off,
    };
    if (!React.isValidElement(children)) {
      return React.cloneElement(<div>{children}</div>, { ...appendProps });
    }
    return React.cloneElement(children, { ...appendProps });
  };

  return (
    <div>
      {getTriggerChildren(children || triggerElement)}
      {hover && (
        <Portal>
          <CSSTransition
            appear
            timeout={{
              appear: DEFAULT_TRANSITION_TIMEOUT,
            }}
            in={hover}
            nodeRef={popupRef}
            {...getTransitionParams({
              classPrefix,
              fadeAnimation: keepFade,
            })}
          >
            <div
              className={classnames(
                `${classPrefix}-popup`,
                `${classPrefix}-tooltip`,
                {
                  [`${classPrefix}-tooltip--${theme}`]: theme,
                  [`${classPrefix}-tooltip--noshadow`]: !showShadow,
                },
                className,
              )}
              data-popper-placement={placement}
              ref={popupRef}
            >
              <div
                className={classnames(`${classPrefix}-popup__content`, {
                  [`${classPrefix}-popup__content--arrow`]: showArrow,
                })}
                style={{
                  position: 'absolute',
                  left: position?.left,
                  top: position?.top,
                  ...style,
                }}
                ref={contentRef}
              >
                {content}
                {showArrow && <div className={`${classPrefix}-popup__arrow`} />}
              </div>
            </div>
          </CSSTransition>
        </Portal>
      )}
    </div>
  );
};

TooltipLite.displayName = 'Tooltiplite';
TooltipLite.defaultProps = tooltipLiteDefaultProps;

export default React.memo(TooltipLite);
