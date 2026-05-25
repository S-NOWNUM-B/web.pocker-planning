import {
  Button as HeadlessButton,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'; // Импортируем компоненты Button, Dialog, DialogPanel, DialogTitle, Transition и TransitionChild из библиотеки Headless UI
import { Fragment, type ReactNode } from 'react'; // Импортируем тип ReactNode и Fragment из React

// Интерфейс для пропсов компонента Modal
export interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

// Компонент Modal, который отображает модальное окно с анимацией и оверлеем
export function Modal({ children, isOpen, onClose, title, className = '' }: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-1000" onClose={onClose}>
        {/* Оверлей с анимацией затемнения */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/55 transition-opacity" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`w-full max-w-125 transform overflow-hidden rounded-2xl border border-border/70 bg-card p-6 text-left align-middle text-card-foreground shadow-2xl transition-all ${className}`}
              >
                {title && (
                  <div className="mb-4 flex items-center justify-between">
                    <DialogTitle as="h2" className="text-xl font-semibold text-foreground">
                      {title}
                    </DialogTitle>
                    <HeadlessButton
                      type="button"
                      className="inline-flex cursor-pointer justify-center rounded-md p-1 text-xl leading-none text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus:outline-none"
                      onClick={onClose}
                    >
                      ×
                    </HeadlessButton>
                  </div>
                )}
                <div>{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
