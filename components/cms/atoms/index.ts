import HeadingAtom from './Heading';
import TextAtom from './Text';
import ImageAtom from './Image';
import ButtonCTA from './Button';
import SpacerAtom from './Spacer';
import ProductCarousel from './ProductCarousel';
import ContainerAtom from './Container';

export const ATOMIC_MAP: Record<string, React.FC<any>> = {
  ATOMIC_HEADING: HeadingAtom,
  ATOMIC_TEXT: TextAtom,
  ATOMIC_IMAGE: ImageAtom,
  ATOMIC_BUTTON: ButtonCTA,
  ATOMIC_SPACER: SpacerAtom,
  ATOMIC_PRODUCT_CAROUSEL: ProductCarousel,
  ATOMIC_CONTAINER: ContainerAtom,
};