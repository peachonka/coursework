using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BudgetApi.Models;

namespace BudgetApi.Services
{
    public interface ITokenGenerator
    {
        string GenerateToken(User user);
    }
    public class JwtTokenGenerator : ITokenGenerator
    {
        private readonly string _jwtKey;

        public JwtTokenGenerator(IConfiguration config)
        {
            _jwtKey = config["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key is missing in configuration");
        }

        public string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwtKey)); // Используем _jwtKey вместо secretKey
                
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}