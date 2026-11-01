import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST({ request }: { request: Request }) {
    try {
        const body = await request.json();

        const { rating, message, author_name, is_anonymous } = body;

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return Response.json(
                { error: 'Please select a valid rating.' },
                { status: 400 }
            );
        }

        if (
            typeof message !== 'string' ||
            message.trim().length < 1 ||
            message.trim().length > 500
        ) {
            return Response.json(
                { error: 'Message must be between 1 and 500 characters.' },
                { status: 400 }
            );
        }

        if (typeof is_anonymous !== 'boolean') {
            return Response.json(
                { error: 'Invalid submission.' },
                { status: 400 }
            );
        }

        const name = is_anonymous
            ? 'Anonymous'
            : typeof author_name === 'string'
                ? author_name.trim()
                : '';

        if (name.length > 80 || (!is_anonymous && !name)) {
            return Response.json(
                { error: 'Please enter a valid name.' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('feedback')
            .insert({
                rating,
                message: message.trim(),
                author_name: name,
                is_anonymous,
            });

        if (error) {
            console.error('Supabase insert error:', error);
            return Response.json(
                { error: 'Could not save your feedback. Please try again.' },
                { status: 500 }
            );
        }

        return Response.json(
            { message: 'Feedback saved successfully!' },
            { status: 200 }
        );
    } catch {
        return Response.json(
            { error: 'Invalid request.' },
            { status: 400 }
        );
    }
}