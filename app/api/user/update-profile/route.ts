import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendMail } from '@/lib/email';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { salutation, name } = body;

    if (!salutation || !['Mr.', 'Ms.', 'Mrs.'].includes(salutation)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid salutation.' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    await connectDB();

    const userEmail = session.user.email.toLowerCase();
    const existingUser = await User.findOne({ email: userEmail }).select('salutation name email').lean();

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    const previousSalutation = existingUser.salutation || '';
    const previousName = existingUser.name || '';
    const updatedSalutation = salutation;
    const updatedName = name.trim();

    const isSalutationChanged = previousSalutation !== updatedSalutation;
    const isNameChanged = previousName !== updatedName;

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { salutation: updatedSalutation, name: updatedName },
      { new: true }
    )
      .select('salutation name email')
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user profile.' },
        { status: 500 }
      );
    }

    let updateDetailsText = '';
    let updateDetailsHtml = '';

    if (isSalutationChanged && isNameChanged) {
      updateDetailsText = `Previous Details: ${previousSalutation} ${previousName}\nUpdated Details: ${updatedSalutation} ${updatedName}`;
      updateDetailsHtml = `<p><b>Profile Changes:</b></p><p>Previous: ${previousSalutation} ${previousName}</p><p>Updated: ${updatedSalutation} ${updatedName}</p>`;
    } else if (isSalutationChanged) {
      updateDetailsText = `Previous Title: ${previousSalutation}\nUpdated Title: ${updatedSalutation}`;
      updateDetailsHtml = `<p><b>Title Change:</b></p><p>Previous: ${previousSalutation}</p><p>Updated: ${updatedSalutation}</p>`;
    } else if (isNameChanged) {
      updateDetailsText = `Previous Full Name: ${previousName}\nUpdated Full Name: ${updatedName}`;
      updateDetailsHtml = `<p><b>Full Name Change:</b></p><p>Previous: ${previousName}</p><p>Updated: ${updatedName}</p>`;
    } else {
      updateDetailsText = `No profile fields were modified.`;
      updateDetailsHtml = `<p>No profile fields were modified.</p>`;
    }

    await sendMail({
      to: userEmail,
      from: 'ResTructor AI Team',
      subject: 'ResTructor AI Profile Update Notification',
      text: `Hello ${updatedSalutation} ${updatedName},\n\nYour ResTructor AI profile has been updated.\n\n${updateDetailsText}`,
      html: `<p>Profile Update Notification</p><h3>Hello ${updatedSalutation} ${updatedName}</h3><p>Your profile information has been updated successfully.</p><hr style="border:0.5px solid #000; margin:15px 0;" />${updateDetailsHtml}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully.',
        user: {
          salutation: updatedUser.salutation,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error?.message ? error.message : error);

    return NextResponse.json(
      { success: false, error: 'An error occurred while updating profile.' },
      { status: 500 }
    );
  }
}
