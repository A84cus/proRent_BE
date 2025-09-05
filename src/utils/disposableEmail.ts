// Disposable Email Generator untuk ProRent
// Generates random disposable email addresses from disposablemail.com

export class DisposableEmailGenerator {
  private static domains = [
    "@disposablemail.com",
    "@tempmail.com",
    "@10minutemail.com",
    "@yopmail.com",
    "@guerrillamail.com",
    "@mailinator.com",
  ];

  // Generate disposable email khusus untuk disposablemail.com
  static generateDisposableMail(prefix: string = "prorent"): string {
    const randomId = Math.random().toString(36).substring(2, 12);
    const timestamp = Date.now().toString(36);

    return `${prefix}-${randomId}-${timestamp}@disposablemail.com`;
  }

  // Generate random disposable email dari berbagai provider
  static generate(prefix: string = "prorent"): string {
    const randomId = Math.random().toString(36).substring(2, 12);
    const timestamp = Date.now().toString(36);
    const domain =
      this.domains[Math.floor(Math.random() * this.domains.length)];

    return `${prefix}-${randomId}-${timestamp}${domain}`;
  }

  // Check if email is disposable
  static isDisposable(email: string): boolean {
    return this.domains.some((domain) =>
      email.toLowerCase().includes(domain.toLowerCase())
    );
  }

  // Get instructions for checking emails based on domain
  static getInstructions(email: string): string {
    if (email.includes("@disposablemail.com")) {
      return `
📧 Cara cek email di Disposable Mail:
1. 🌐 Buka: https://www.disposablemail.com/
2. 📧 Masukkan email: ${email}
3. 📬 Klik "Check Mail" atau refresh halaman
4. ✉️ Lihat email dari ProRent di inbox
5. ⏰ Email biasanya muncul dalam 10-30 detik
      `;
    }

    if (email.includes("@yopmail.com")) {
      return `
📧 Cara cek email di YOPmail:
1. 🌐 Buka: https://yopmail.com/
2. 📧 Masukkan email: ${email}
3. 📬 Klik "Check Inbox"
4. ✉️ Lihat email dari ProRent
      `;
    }

    if (email.includes("@tempmail.com")) {
      return `
📧 Cara cek email di TempMail:
1. 🌐 Buka: https://temp-mail.org/
2. 📧 Masukkan email: ${email}
3. 📬 Refresh halaman untuk cek email baru
4. ✉️ Lihat email dari ProRent
      `;
    }

    return `
📧 Cara cek email:
1. 🌐 Buka website email provider
2. 📧 Masukkan email: ${email}
3. 📬 Cek inbox untuk email dari ProRent
    `;
  }

  // Log email redirect information
  static logRedirect(originalEmail: string, disposableEmail: string): void {
    console.log(`\n📧 EMAIL REDIRECT:`);
    console.log(`Original: ${originalEmail}`);
    console.log(`Redirected to: ${disposableEmail}`);
    console.log(this.getInstructions(disposableEmail));
  }
}

export default DisposableEmailGenerator;
