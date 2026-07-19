import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderForm from './OrderForm';

describe('OrderForm Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly with default labels and inputs', () => {
    render(<OrderForm />);
    
    // Check that form header title and submit button are present
    expect(screen.getByText('اطلبي تصميمك أو استفسري')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /إرسال الطلب والاستفسار عبر واتساب/i })).toBeInTheDocument();
    
    // Check input labels
    expect(screen.getByLabelText(/اسم العروسين/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/تاريخ الفرح/i)).toBeInTheDocument();
  });

  it('shows validation error when trying to submit empty form', () => {
    render(<OrderForm />);
    
    const submitBtn = screen.getByRole('button', { name: /إرسال الطلب والاستفسار عبر واتساب/i });
    fireEvent.click(submitBtn);
    
    // Validation message should appear
    expect(screen.getByText(/يرجى إدخال اسم العروسين لتخصيص التصميم/i)).toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('generates correct WhatsApp message when standard order is submitted', () => {
    render(<OrderForm />);
    
    const nameInput = screen.getByLabelText(/اسم العروسين/i);
    fireEvent.change(nameInput, { target: { value: 'أحمد ومنى' } });
    
    const dateInput = screen.getByLabelText(/تاريخ الفرح/i);
    fireEvent.change(dateInput, { target: { value: '2026-10-15' } });

    const colorsInput = screen.getByLabelText(/الألوان المفضلة/i);
    fireEvent.change(colorsInput, { target: { value: 'أبيض وذهبي' } });

    const submitBtn = screen.getByRole('button', { name: /إرسال الطلب والاستفسار عبر واتساب/i });
    fireEvent.click(submitBtn);

    // Form should submit and open WhatsApp window
    expect(window.open).toHaveBeenCalledTimes(1);
    
    // Verify the URL includes the correctly prefilled text
    const openedUrl = window.open.mock.calls[0][0];
    expect(openedUrl).toContain('https://wa.me/201066307580');
    expect(openedUrl).toContain(encodeURIComponent('اسم العروسين: أحمد ومنى'));
    expect(openedUrl).toContain(encodeURIComponent('تاريخ الفرح: 2026-10-15'));
    expect(openedUrl).toContain(encodeURIComponent('الألوان المفضلة: أبيض وذهبي'));
  });

  it('dynamically adapts form inputs when selecting general inquiry option', () => {
    render(<OrderForm />);
    
    // Select the inquiry option
    const selectEl = screen.getByLabelText(/القسم أو طبيعة الطلب/i);
    fireEvent.change(selectEl, { target: { value: 'استفسار عام / متابعة طلب قائم' } });
    
    // Label should change to general name label
    expect(screen.getByLabelText(/الاسم الكامل للتواصل/i)).toBeInTheDocument();
    
    // Date and colors input fields should be hidden
    expect(screen.queryByLabelText(/تاريخ الفرح/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/الألوان المفضلة/i)).not.toBeInTheDocument();
    
    // Fill full name and notes and submit
    const nameInput = screen.getByLabelText(/الاسم الكامل للتواصل/i);
    fireEvent.change(nameInput, { target: { value: 'سارة خالد' } });
    
    const notesInput = screen.getByLabelText(/تفاصيل الاستفسار أو الأوردر للمتابعة/i);
    fireEvent.change(notesInput, { target: { value: 'سؤال بخصوص أوردر رقم #1024' } });
    
    const submitBtn = screen.getByRole('button', { name: /إرسال الطلب والاستفسار عبر واتساب/i });
    fireEvent.click(submitBtn);

    expect(window.open).toHaveBeenCalledTimes(1);
    const openedUrl = window.open.mock.calls[0][0];
    
    // Prefilled message should be inquiry-oriented
    expect(openedUrl).toContain(encodeURIComponent('الاسم الكامل: سارة خالد'));
    expect(openedUrl).toContain(encodeURIComponent('عندي استفسار أو حابة أتابع الأوردر بتاعي'));
    expect(openedUrl).not.toContain(encodeURIComponent('تاريخ الفرح'));
  });
});
