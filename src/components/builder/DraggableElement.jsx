import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AtomText from './atoms/AtomText';
import AtomImage from './atoms/AtomImage';
import AtomButton from './atoms/AtomButton';
import AtomContainer from './atoms/AtomContainer';
import AtomHero from './atoms/AtomHero';
import AtomFeatures from './atoms/AtomFeatures';
import AtomPricing from './atoms/AtomPricing';
import AtomCallToAction from './atoms/AtomCallToAction';
import AtomForm from './atoms/AtomForm';

const COMPONENT_MAP = {
    text: AtomText,
    image: AtomImage,
    button: AtomButton,
    container: AtomContainer,
    hero: AtomHero,
    features: AtomFeatures,
    pricing: AtomPricing,
    cta: AtomCallToAction,
    form: AtomForm
};

const DraggableElement = ({ element, isSelected, onSelect }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: element.id, data: { ...element, isCanvasElement: true } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        border: isSelected ? '2px solid #4F46E5' : '1px dashed transparent', // Highlight selected
        position: 'relative',
        marginBottom: '4px'
    };

    const Component = COMPONENT_MAP[element.type] || AtomText;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation(); // Prevent canvas select
                onSelect(element.id);
            }}
            className="group hover:ring-1 ring-slate-300 relative"
        >
            {/* Drag Handle (Only visible on hover or select) */}
            <div
                {...attributes}
                {...listeners}
                className={`absolute -top-3 -left-3 p-1 bg-white border rounded shadow cursor-move z-10 ${isSelected || 'group-hover:block hidden'}`}
            >
                ✋
            </div>

            <Component {...element} />
        </div>
    );
};

export default DraggableElement;
