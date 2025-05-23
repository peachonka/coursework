using BudgetApi.Data;
using BudgetApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace BudgetApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenGenerator _tokenGenerator;

        public AuthService(
            AppDbContext context, 
            IPasswordHasher passwordHasher,
            ITokenGenerator tokenGenerator)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenGenerator = tokenGenerator;
        }

        public async Task<User> Register(RegisterDto registerDto)
        {
            // Проверка существования пользователя
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new Exception("Пользователь с таким email уже существует");
            }

            // // Создание семьи
            // var family = new Family 
            // { 
            //     Id = Guid.NewGuid().ToString(), // Добавляем явную инициализацию Id
            //     Name = registerDto.FamilyName
            // };

            // Создание пользователя
            var user = new User 
            {
                Email = registerDto.Email,
                PasswordHash = _passwordHasher.HashPassword(registerDto.Password),
                Name = registerDto.Name
            };

            // // Создание члена семьи
            // var familyMember = new FamilyMember
            // {
            //     Name = registerDto.Name,
            //     RelationshipType = registerDto.RelationshipType,
            //     UserId = user.Id,
            //     FamilyId = family.Id,
            //     Role = "admin" // Первый пользователь становится админом
            // };

            // await _context.Families.AddAsync(family);
            await _context.Users.AddAsync(user);
            // await _context.FamilyMembers.AddAsync(familyMember);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<string> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, loginDto.Password))
            {
                throw new Exception("Неверный email или пароль");
            }

            return _tokenGenerator.GenerateToken(user);
        }

        public async Task<bool> AssignAdminRole(string currentUserId, string targetUserId)
        {
            var currentUser = await _context.FamilyMembers
                .FirstOrDefaultAsync(fm => fm.UserId == currentUserId);
            
            if (currentUser?.Role != "admin") 
                return false;

            var targetMember = await _context.FamilyMembers
                .FirstOrDefaultAsync(fm => fm.UserId == targetUserId);
            
            if (targetMember == null) 
                return false;

            targetMember.Role = "admin";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}