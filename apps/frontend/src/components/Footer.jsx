import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About GameStore</h3>
            <p className="text-gray-300">
              Your one-stop destination for the best digital games. We offer a wide selection
              of games across different genres and platforms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/games" className="text-gray-300 hover:text-white transition">
                  Browse Games
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white transition">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: support@gamestore.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Game Street, Digital City</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} GameStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 