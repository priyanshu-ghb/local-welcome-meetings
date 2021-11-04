import Auth from './Auth';
import Modal from './Modal';

export default function AuthModal({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: Function }) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <Auth redirectTo={''} />
    </Modal>
  )
}